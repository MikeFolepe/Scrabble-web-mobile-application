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
import android.widget.Toast
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.Board
import com.example.scrabbleprototype.objects.LetterRack
import com.example.scrabbleprototype.services.PlaceService
import com.example.scrabbleprototype.services.SkipTurnService
import com.example.scrabbleprototype.services.SwapLetterService
import com.example.scrabbleprototype.viewModel.PlacementViewModel
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper


class BoardFragment : Fragment() {

    var board = Board.cases
    private val socket = SocketHandler.getPlayerSocket()

    private lateinit var placeService: PlaceService
    private var placeBound: Boolean = false

    private val placementViewModel: PlacementViewModel by activityViewModels()

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            placeService = (service as PlaceService.LocalBinder).getService()
            placeBound = true
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            placeBound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Intent(activity, PlaceService::class.java).also { intent ->
            activity?.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_board, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        receiveOpponentPlacement(view)
        setupBoard(view)
    }

    override fun onStop() {
        super.onStop()
        placeBound = false
    }

    private fun receiveOpponentPlacement(view: View) {
        socket.on("receivePlacement") { response ->
            Log.d("receive", response[1].toString())
            Log.d("receive", response[2].toString())
            Log.d("receive", response[3].toString())

            val mapper = jacksonObjectMapper()
            val startPosition = mapper.readValue(response[1].toString(), Vec2::class.java)
            val orientation = mapper.readValue(response[2].toString(), Orientation::class.java)
            val word = response[3] as String
            activity?.runOnUiThread { placeService.placeByOpponent(startPosition, orientation, word, view.findViewById(R.id.board)) }
        }
    }

    private fun setupBoard(view: View) {
        initializeBoard()
        val boardView = view.findViewById<RecyclerView>(R.id.board)
        val gridLayoutManager = GridLayoutManager(activity, 15, GridLayoutManager.VERTICAL, false)
        boardView.layoutManager = gridLayoutManager
        val boardAdapter = BoardAdapter(board)
        boardView.adapter = boardAdapter
        boardAdapter.updateData(board)

        boardAdapter.onPlacement = { startPosition, boardPosition ->
            placementViewModel.addLetter(boardPosition, board[boardPosition].value)
            // We drag from letter rack
            if(startPosition < Constants.RACK_SIZE) {
                LetterRack.removeLetter(startPosition)
                val letterRackAdapter = activity?.findViewById<RecyclerView>(R.id.letter_rack)?.adapter
                letterRackAdapter?.notifyDataSetChanged()
            } else { // We drag from the board
                board[startPosition] = Constants.EMPTY_LETTER
                boardAdapter.notifyItemChanged(startPosition)
                placementViewModel.removeLetter(startPosition)
            }
        }
    }

    private fun initializeBoard() {
        for(i in 0..224 ) {
            board.add(Constants.EMPTY_LETTER)
        }
    }



}
