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
import android.widget.Toast
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.activities.GameActivity
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.Board
import com.example.scrabbleprototype.objects.LetterRack
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.Reserve
import com.example.scrabbleprototype.services.SwapLetterService
import com.example.scrabbleprototype.viewModel.PlacementViewModel
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

class LetterRackFragment : Fragment() {

    private val reserve = Reserve.RESERVE
    private val hashMap = hashMapOf<String, Letter>()
    private val letterPos = hashMapOf<Int, Letter>()
    private lateinit var letterRackAdapter: LetterRackAdapter
    private lateinit var letterRackView: RecyclerView
    private val board = Board.cases
    private val placementViewModel: PlacementViewModel by activityViewModels()

    private lateinit var swapLetterService: SwapLetterService
    private var swapLetterBound: Boolean = false

    lateinit var activityContext: Context

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as SwapLetterService.LocalBinder
            swapLetterService = binder.getService()
            swapLetterBound = true
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            swapLetterBound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Intent(activityContext, SwapLetterService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
    }

    override fun onStop() {
        super.onStop()
        activityContext.unbindService(connection)
        swapLetterBound = false
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
        return inflater.inflate(R.layout.fragment_letter_rack, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        updatePlayer(view)
        setupLetterRack(view)
        setupSwapButton(view)
        setupDragListener(view)

        for(element in reserve) {
            hashMap[element.value] = element
        }
    }

    private fun setupLetterRack(view: View) {
        Log.d("easelInit", Players.currentPlayer.letterTable[6].value)
        LetterRack.letters = Players.currentPlayer.letterTable
        Log.d("easelInit", LetterRack.letters[6].value)
        letterRackView = view.findViewById<RecyclerView>(R.id.letter_rack)
        val horizontalLayoutManager = LinearLayoutManager(activity, LinearLayoutManager.HORIZONTAL, false)
        letterRackView.layoutManager = horizontalLayoutManager
        letterRackAdapter = LetterRackAdapter(LetterRack.letters)
        letterRackView.adapter = letterRackAdapter
        letterRackAdapter.updateData(LetterRack.letters)

        letterRackAdapter.onLetterClick = { position ->
            Toast.makeText(activity, "Lettre sélectionnée : " + LetterRack.letters[position].value, Toast.LENGTH_LONG).show()
            letterPos[position] = LetterRack.letters[position]
        }
    }

    private fun setupSwapButton(view : View) {
        val swapButton = view.findViewById<Button>(R.id.swap_button)
        val letterRackView = view.findViewById<RecyclerView>(R.id.letter_rack)
        swapButton.setOnClickListener {
            if(swapLetterBound) swapLetterService.swapLetters(letterPos, letterRackView)
        }
    }

    private fun updatePlayer(view: View) {
        SocketHandler.getPlayerSocket().on("updatePlayer") { response ->
            activity?.runOnUiThread {
                val mapper = jacksonObjectMapper()
                val playerReceived = mapper.readValue(response[0].toString(), Player::class.java)
                Log.d("easelUpdate", playerReceived.name + " " + Players.currentPlayer.name)
                if(Players.currentPlayer.name == playerReceived.name) {
                    Players.currentPlayer.letterTable = playerReceived.letterTable
                    Players.currentPlayer.score = playerReceived.score
                    LetterRack.letters = Players.currentPlayer.letterTable
                } else {
                    val opponentToUpdate = Players.opponents.find { it.name == playerReceived.name }
                    opponentToUpdate?.letterTable = playerReceived.letterTable
                    opponentToUpdate?.score = playerReceived.score
                }
                letterRackAdapter = LetterRackAdapter(LetterRack.letters)
                letterRackView.adapter = letterRackAdapter
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
        val boardAdapter = activity?.findViewById<RecyclerView>(R.id.board)?.adapter
        boardAdapter?.notifyItemChanged(dragStartPosition)
        placementViewModel.removeLetter(dragStartPosition)
    }
}
