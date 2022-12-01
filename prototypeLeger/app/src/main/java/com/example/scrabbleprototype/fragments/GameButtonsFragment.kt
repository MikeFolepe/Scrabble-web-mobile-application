package com.example.scrabbleprototype.fragments

import android.content.*
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import android.view.ContextThemeWrapper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentGameButtonsBinding
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Player
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.*
import com.example.scrabbleprototype.services.EndTurnCallback
import com.example.scrabbleprototype.services.PlaceService
import com.example.scrabbleprototype.services.SkipTurnService
import com.example.scrabbleprototype.services.SwapLetterService
import com.example.scrabbleprototype.viewModel.PlacementViewModel
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import java.util.*
import kotlin.concurrent.timerTask

class GameButtonsFragment : Fragment(), EndTurnCallback {
    private val board = Board.cases
    private val placementViewModel: PlacementViewModel by activityViewModels()
    private val socket = SocketHandler.getPlayerSocket()

    private lateinit var skipTurnService: SkipTurnService
    private var skipTurnBound: Boolean = false
    private lateinit var placeService: PlaceService
    private var placeBound: Boolean = false
    private lateinit var swapService: SwapLetterService
    private var swapBound: Boolean = false
    private lateinit var activityContext: Context

    private var _binding: FragmentGameButtonsBinding? = null
    private val binding get() = _binding!!

    private val onPlacingBestWord = object: BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if(intent?.action == "handleInvalidPlacement") {
                Log.d("broadcast", "gooood")
                handleInvalidPlacement()
            }
        }
    }

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            if(service is SkipTurnService.LocalBinder) {
                skipTurnService = service.getService()
                skipTurnBound = true
                skipTurnService.setEndTurnCallback(this@GameButtonsFragment)
            } else if (service is PlaceService.LocalBinder) {
                placeService = service.getService()
                placeBound = true
            } else if (service is SwapLetterService.LocalBinder) {
                swapService = service.getService()
                swapBound = true
            }
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            skipTurnBound = false
            placeBound = false
            swapBound = false
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        _binding = FragmentGameButtonsBinding.inflate(inflaterWithTheme)
        receivePlacementFail()
        receivePlacementSuccess()
        receiveNewPlayer()
        setupSkipButton()
        setupPlayButton()
        setupLeaveButton()
        return binding.root
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
        val broadcastManager = LocalBroadcastManager.getInstance(requireContext())
        broadcastManager.registerReceiver(onPlacingBestWord, IntentFilter("handleInvalidPlacement"))
    }

    override fun onStop() {
        super.onStop()
        skipTurnBound = false
        placeBound = false
        swapBound = false
        skipTurnService.setEndTurnCallback(null)
        activityContext.unbindService(connection)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Intent(activityContext, SkipTurnService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
        Intent(activityContext, PlaceService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
        Intent(activityContext, SwapLetterService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        LocalBroadcastManager.getInstance(requireContext()).unregisterReceiver(onPlacingBestWord)
    }

    private fun setupSkipButton() {
        binding.skipTurnButton.setOnClickListener {
            skipTurnService.switchTimer()
        }
        binding.player = Players.getCurrent()
    }

    private fun setupPlayButton() {
        binding.playTurnButton.isEnabled = false
        val placementObserver = Observer<Int> { placementLength ->
            if(Players.currentPlayer.getTurn()) binding.playTurnButton.isEnabled = placementLength != 0
        }
        placementViewModel.currentPlacementLength.observe(viewLifecycleOwner, placementObserver)

        binding.playTurnButton.setOnClickListener { placeWord() }
    }

    private fun setupLeaveButton() {
        binding.giveUpButton.setOnClickListener {
            val builder = AlertDialog.Builder(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
            builder.setMessage("Voulez-vous quitter cette partie ?")
                .setCancelable(false)
                .setPositiveButton("Confirmer") { dialog, id ->
                    skipTurnService.switchTimer()
                    if(Users.currentUser.isObserver) socket.emit("sendObserverLeave", CurrentRoom.myRoom.id)
                    else socket.emit("sendGiveUp", Users.currentUser.pseudonym, CurrentRoom.myRoom.id)
                    dialog.dismiss()
                }
                .setNegativeButton("Annuler") { dialog, id ->
                    dialog.dismiss()
                }
            val alert: AlertDialog = builder.create()
            alert.setTitle("Confirmation d'abandon")
            alert.show()
        }
    }

    private fun placeWord() {
        val placementPositions = placementViewModel.currentPlacement.toList().sortedBy { (k, v) -> k }.toMap().keys.toIntArray()
        binding.playTurnButton.isEnabled = false

        if(placeService.validatePlacement(placementPositions)) {
            placeService.sendPlacement()
            skipTurnService.switchTimer()
        }
        else handleInvalidPlacement()
    }

    override fun handleInvalidPlacement() {
        if(placementViewModel.currentPlacement.isEmpty()) return
        Log.d("inva", "going through")
        val letterRackAdapter = activity?.findViewById<RecyclerView>(R.id.letter_rack)?.adapter
        val boardAdapter = activity?.findViewById<RecyclerView>(R.id.board)?.adapter

        activity?.runOnUiThread {
            for(letter in placementViewModel.currentPlacement) {
                val letterToRemove = board[letter.key]
                board[letter.key] = Constants.EMPTY_LETTER
                boardAdapter?.notifyItemChanged(letter.key)

                letterToRemove.value = letterToRemove.value.uppercase()
                LetterRack.letters.add(letterToRemove)
                letterRackAdapter?.notifyItemChanged(LetterRack.letters.size - 1)
            }
            placementViewModel.clearPlacement()
            Toast.makeText(activityContext, "Le placement est invalide", Toast.LENGTH_LONG).show()
        }
        Log.d("invalid", LetterRack.letters.size.toString())
    }

    private fun receivePlacementSuccess() {
        socket.on("receiveSuccess") {
            placeService.isFirstPlacement = false
            for(letter in placementViewModel.currentPlacement) {
                board[letter.key].isValidated = true
            }
            activity?.runOnUiThread { placementViewModel.clearPlacement() }
        }
    }

    private fun receivePlacementFail() {
        socket.on("receiveFail") {
            handleInvalidPlacement()
        }
    }

    private fun receiveNewPlayer(){
        socket.on("newPlayer") { response ->
            val newPlayer = jacksonObjectMapper().readValue(response[0].toString(), Player::class.java)
            if(Users.currentUser.pseudonym == newPlayer.name){
                Timer().schedule(timerTask {
                    Log.d("onoupdate", "lecurrent")
                    binding.player = Players.getCurrent()
                }, 100)
            }
        }
    }
}
