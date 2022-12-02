package com.example.scrabbleprototype.fragments

import android.content.*
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import android.view.DragEvent
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.recyclerview.widget.RecyclerView.Recycler
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.activities.GameActivity
import com.example.scrabbleprototype.databinding.FragmentGameButtonsBinding
import com.example.scrabbleprototype.databinding.FragmentLetterRackBinding
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.*
import com.example.scrabbleprototype.services.ObserverRackCallback
import com.example.scrabbleprototype.services.CancelSwapCallback
import com.example.scrabbleprototype.services.PlaceService
import com.example.scrabbleprototype.services.SkipTurnService
import com.example.scrabbleprototype.services.SwapLetterService
import com.example.scrabbleprototype.viewModel.PlacementViewModel
import com.example.scrabbleprototype.viewModel.PlayersViewModel
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

class LetterRackFragment : Fragment(), ObserverRackCallback, CancelSwapCallback {

    private val lettersToSwapIndexes = hashMapOf<Int, String>()
    private var swapLength: MutableLiveData<Int> = MutableLiveData(0)
    private lateinit var letterRackAdapter: LetterRackAdapter
    private lateinit var letterRackView: RecyclerView
    private val board = Board.cases

    private val placementViewModel: PlacementViewModel by activityViewModels()
    private val playersViewModel: PlayersViewModel by activityViewModels()

    private lateinit var skipTurnService: SkipTurnService
    private var skipTurnBound: Boolean = false
    private lateinit var swapLetterService: SwapLetterService
    private var swapLetterBound: Boolean = false

    private lateinit var binding: FragmentLetterRackBinding
    lateinit var activityContext: Context

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            if(service is SkipTurnService.LocalBinder) {
                skipTurnService = service.getService()
                skipTurnBound = true
                skipTurnService.setObserverRackCallback(this@LetterRackFragment)
                skipTurnService.setCancelSwapCallback(this@LetterRackFragment)
            } else if (service is SwapLetterService.LocalBinder) {
                swapLetterService = service.getService()
                swapLetterBound = true
            }
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            skipTurnBound = false
            swapLetterBound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Intent(activityContext, SkipTurnService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
        Intent(activityContext, SwapLetterService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
    }

    override fun onStop() {
        super.onStop()
        skipTurnBound = false
        swapLetterBound = false
        skipTurnService.setObserverRackCallback(null)
        skipTurnService.setCancelSwapCallback(null)
        activityContext.unbindService(connection)
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentLetterRackBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        updatePlayer()
        receiveSwap()
        receiveObserverRack()
        setupLetterRack(view)
        setupSwapButtons()
        setupDragListener(view)
    }

    private fun setupLetterRack(view: View) {
        LetterRack.letters = Players.currentPlayer.letterTable
        if(Users.currentUser.isObserver) LetterRack.letters = Players.getActivePlayer().letterTable

        letterRackView = view.findViewById(R.id.letter_rack)
        val horizontalLayoutManager = object: LinearLayoutManager(activity, HORIZONTAL, false) { override fun canScrollHorizontally() = false }
        letterRackView.layoutManager = horizontalLayoutManager
        letterRackAdapter = LetterRackAdapter(LetterRack.letters)
        letterRackView.adapter = letterRackAdapter
        letterRackAdapter.updateData(LetterRack.letters)

        letterRackAdapter.onLetterClick = { position ->
            if(Players.currentPlayer.getTurn() && placementViewModel.currentPlacement.isEmpty()) {
                handleSwap(position)
                Toast.makeText(activity, "Lettre sélectionnée : " + LetterRack.letters[position].value, Toast.LENGTH_LONG).show()
            }
        }
        letterRackAdapter.onLetterDrag = {
            resetSwap()
        }
    }

    private fun setupSwapButtons() {
        val swapButton = binding.swapButton
        letterRackView = binding.letterRack
        swapButton.isEnabled = false
        val swapObserver = Observer<Int> { swapLength ->
            if(Players.currentPlayer.getTurn()) {
                swapButton.isEnabled = swapLength != 0
                binding.cancelButton.isEnabled = swapLength != 0
            }
        }
        swapLength.observe(viewLifecycleOwner, swapObserver)

        swapButton.setOnClickListener {
            if (Reserve.RESERVE.size < Constants.RACK_SIZE) {
                Toast.makeText(requireContext(), "Impossible d'échanger : Il y a moins de 7 lettres dans la réserve", Toast.LENGTH_LONG).show()
                resetSwap()
                return@setOnClickListener
            }
            if(swapLetterBound) swapLetterService.swapLetters(lettersToSwapIndexes)
            resetSwap()
            skipTurnService.switchTimer()
        }

        binding.cancelButton.setOnClickListener {
            resetSwap()
        }
    }

    private fun handleSwap(position: Int) {
        val letterView = letterRackView.findViewHolderForAdapterPosition(position)?.itemView?.findViewById<View>(R.id.swap_border)
            ?: return
        if(LetterRack.letters[position].isSelectedForSwap) {
            letterView.setBackgroundResource(0)
            LetterRack.letters[position].isSelectedForSwap = false
            lettersToSwapIndexes.remove(position)
            swapLength.value = lettersToSwapIndexes.size
        } else {
            letterView.setBackgroundResource(R.drawable.swap_border)
            LetterRack.letters[position].isSelectedForSwap = true
            lettersToSwapIndexes[position] = LetterRack.letters[position].value
            swapLength.value = lettersToSwapIndexes.size
        }
    }

    override fun resetSwap() {
        activity?.runOnUiThread {
            for(i in 0 until LetterRack.letters.size) {
                LetterRack.letters[i].isSelectedForSwap = false
                letterRackView.findViewHolderForAdapterPosition(i)?.itemView?.findViewById<View>(R.id.swap_border)?.setBackgroundResource(0)
            }
            lettersToSwapIndexes.clear()
            swapLength.value = lettersToSwapIndexes.size
        }
    }

    private fun receiveSwap() {
        SocketHandler.socket.on("swapped") { response ->
            LetterRack.letters = jacksonObjectMapper().readValue(response[0] as String, object: TypeReference<ArrayList<Letter>>() {})
            activity?.runOnUiThread {  letterRackAdapter.updateData(LetterRack.letters) }
        }
    }

    private fun updatePlayer() {
        SocketHandler.socket.on("updatePlayer") { response ->
            activity?.runOnUiThread {
                val mapper = jacksonObjectMapper()
                val playerReceived = mapper.readValue(response[0].toString(), Player::class.java)

                if(Players.currentPlayer.name == playerReceived.name) {
                    Players.currentPlayer.letterTable = playerReceived.letterTable
                    Players.currentPlayer.score = playerReceived.score
                    LetterRack.letters = Players.currentPlayer.letterTable
                    letterRackAdapter.updateData(LetterRack.letters)
                }

                val playerToUpdate = Players.players.find { it.name == playerReceived.name }
                playerToUpdate?.letterTable = playerReceived.letterTable
                playerToUpdate?.score = playerReceived.score

                //UPDATE PLAYER IN INFO PANNEL
                val playerIndex = playersViewModel.playersInGame.indexOfFirst { it.name == playerReceived.name }
                if(playerIndex == -1) return@runOnUiThread
                playersViewModel.playersInGame[playerIndex].score = playerReceived.score
                playersViewModel.notifyItemChangedAt(playerIndex)
            }
        }
    }

        private fun setupDragListener(view: View) {
        // Drag listener for board cases
        view.setOnDragListener { v, e ->
            when(e.action) {
                DragEvent.ACTION_DRAG_STARTED -> {
                    return@setOnDragListener e.clipDescription.hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN)
                }
                DragEvent.ACTION_DRAG_ENTERED -> {
                    // Can modify view here to show that the view is being dragged
                    true
                }
                DragEvent.ACTION_DRAG_EXITED -> {
                    // Modify view style back to DRAG_STARTED DragEvent
                    true
                }
                DragEvent.ACTION_DROP -> {
                    if(!Players.currentPlayer.getTurn()) return@setOnDragListener false

                    val letterTouched = e.clipData.getItemAt(0)
                    val letterQuantity: Int = e.clipData.getItemAt(1).text.toString().toInt()
                    val letterScore: Int = e.clipData.getItemAt(2).text.toString().toInt()
                    val dragStartPosition: Int = e.clipData.getItemAt(3).text.toString().toInt()
                    val isDraggedFromRack: Boolean = e.clipData.getItemAt(4).text.toString().toBoolean()
                    val dragData = letterTouched.text // La data de la lettre qui a été dragged

                    // Add letter dropped to rack
                    if(isDraggedFromRack) return@setOnDragListener false
                    LetterRack.letters.add(Letter(dragData.first().toString().lowercase(), letterQuantity, letterScore, false, false))
                    letterRackAdapter.notifyItemChanged(LetterRack.letters.size - 1)
                    // Remove letter dragged of board
                    onPlacementFromBoard(dragStartPosition)
                    true
                }
                DragEvent.ACTION_DRAG_ENDED -> {
                    when(e.result) {
                        true ->
                            Toast.makeText(v.context, "DROP SUCCESSFUL", Toast.LENGTH_LONG)
                        else ->
                            Toast.makeText(v.context, "DROP DIDN'T WORK", Toast.LENGTH_LONG)
                    }.show()
                    true
                }
                else -> {
                    Log.d("dragdrop", "Unknown Action type received by the drag listener")
                    false
                }
            }
        }
    }

    private fun onPlacementFromBoard(dragStartPosition: Int) {
        board[dragStartPosition] = Constants.EMPTY_LETTER
        val boardView = activity?.findViewById<RecyclerView>(R.id.board)
        val boardAdapter = boardView?.adapter
        val caseDragged = boardView?.findViewHolderForAdapterPosition(dragStartPosition)?.itemView
        caseDragged?.findViewById<LinearLayout>(R.id.letter_layer)?.setBackgroundResource(0)
        caseDragged?.findViewById<TextView>(R.id.letter)?.text = ""
        caseDragged?.findViewById<TextView>(R.id.letter_score)?.text = ""

        boardAdapter?.notifyItemChanged(dragStartPosition)
        placementViewModel.removeLetter(dragStartPosition)
    }

    override fun switchRack(activePlayerName: String) {
        // Update observer rack
        activity?.runOnUiThread {
            val currentPlayer = Players.players.find { it.name == activePlayerName } ?: return@runOnUiThread
            LetterRack.letters = currentPlayer.letterTable
            letterRackAdapter.updateData(LetterRack.letters)
        }
    }

    private fun receiveObserverRack() {
        SocketHandler.socket.on("giveRackToObserver") { response ->
            activity?.runOnUiThread {
                LetterRack.letters = Players.currentPlayer.letterTable
                letterRackAdapter.updateData(LetterRack.letters)
            }
        }
    }
}
