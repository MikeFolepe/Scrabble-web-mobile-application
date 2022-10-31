package com.example.scrabbleprototype.fragments

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentGameButtonsBinding
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.Board
import com.example.scrabbleprototype.objects.LetterRack
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.services.PlaceService
import com.example.scrabbleprototype.services.SkipTurnService
import com.example.scrabbleprototype.services.SwapLetterService
import com.example.scrabbleprototype.viewModel.PlacementViewModel

class GameButtonsFragment : Fragment() {
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

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            if(service is SkipTurnService.LocalBinder) {
                skipTurnService = service.getService()
                skipTurnBound = true
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        _binding = FragmentGameButtonsBinding.inflate(inflater, container, false)
        receivePlacementFail()
        receivePlacementSuccess()
        setupSkipButton()
        setupPlayButton()
        return binding.root
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }

    override fun onStop() {
        super.onStop()
        activityContext.unbindService(connection)
        skipTurnBound = false
        placeBound = false
        swapBound = false
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
    }

    private fun setupSkipButton() {
        binding.skipTurnButton.setOnClickListener {
            skipTurnService.switchTimer()
        }
        binding.player = Players.currentPlayer
    }

    private fun setupPlayButton() {
        val placementObserver = Observer<Int> { placementLength ->
            binding.playTurnButton.isEnabled = placementLength != 0
        }
        placementViewModel.currentPlacementLength.observe(viewLifecycleOwner, placementObserver)

        binding.playTurnButton.setOnClickListener {
            val placementPositions = placementViewModel.currentPlacement.toList().sortedBy { (k, v) -> k }.toMap().keys.toIntArray()
            skipTurnService.switchTimer()

            if(placeService.validatePlacement(placementPositions)) {
                Log.d("placing", "PASSED")
                placeService.sendPlacement()
            }
            else handleInvalidPlacement()
        }
    }

    private fun handleInvalidPlacement() {
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
        }
    }

    private fun receivePlacementSuccess() {
        socket.on("receiveSuccess") { response ->
            placeService.isFirstPlacement = false
            activity?.runOnUiThread { placementViewModel.clearPlacement() }
        }
    }

    private fun receivePlacementFail() {
        socket.on("receiveFail") { response ->
            handleInvalidPlacement()
        }
    }
}
