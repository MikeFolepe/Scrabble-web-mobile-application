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
import android.widget.ImageView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.Board
import com.example.scrabbleprototype.objects.LetterRack
import com.example.scrabbleprototype.objects.Reserve
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.services.PlaceService
import com.example.scrabbleprototype.services.SkipTurnService
import com.example.scrabbleprototype.services.SwapLetterService
import com.example.scrabbleprototype.viewModel.PlacementViewModel
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper


class BoardFragment : Fragment() {

    var board = Board.cases
    private lateinit var boardView: RecyclerView
    private var opponentStartingCase: Int? = null
    private val socket = SocketHandler.getPlayerSocket()
    private lateinit var boardAdapter : BoardAdapter

    private lateinit var placeService: PlaceService
    private var placeBound: Boolean = false

    private val placementViewModel: PlacementViewModel by activityViewModels()
    private val mapper = jacksonObjectMapper()

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
        receiveObserverBoard()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        return inflaterWithTheme.inflate(R.layout.fragment_board, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        receiveOpponentPlacement(view)
        receiveOpponentStartingCase()
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

            val startPosition = mapper.readValue(response[1].toString(), Vec2::class.java)
            val orientation = mapper.readValue(response[2].toString(), Orientation::class.java)
            val word = response[3] as String
            activity?.runOnUiThread { placeService.placeByOpponent(startPosition, orientation, word, view.findViewById(R.id.board)) }
        }
    }

    private fun setupBoard(view: View) {
        initializeBoard()
        boardView = view.findViewById(R.id.board)
        val gridLayoutManager = GridLayoutManager(activity, 15, GridLayoutManager.VERTICAL, false)
        boardView.layoutManager = gridLayoutManager
        boardAdapter = BoardAdapter(board)
        boardView.adapter = boardAdapter
        boardAdapter.updateData(board)

        boardAdapter.onPlacement = { dragStartPosition, boardPosition, draggedFromRack ->
            placementViewModel.addLetter(boardPosition, board[boardPosition].value)
            // We drag from letter rack
            if(draggedFromRack) {
                LetterRack.letters.removeAt(dragStartPosition)
                val letterRackAdapter = activity?.findViewById<RecyclerView>(R.id.letter_rack)?.adapter
                letterRackAdapter?.notifyDataSetChanged()
            } else { // We drag from the board
                board[dragStartPosition] = Constants.EMPTY_LETTER
                boardAdapter.notifyItemChanged(dragStartPosition)
                placementViewModel.removeLetter(dragStartPosition)
            }
        }
    }

    private fun initializeBoard() {
        for(i in board.size until Constants.BOARD_SIZE ) {
            board.add(Constants.EMPTY_LETTER)
        }
    }

    private fun receiveOpponentStartingCase() {
        socket.on("receiveStartingCase") { response ->
            // Erase the last starting case border
            eraseStartingCase()
            // Draw the new one
            val startingCase: Vec2 = mapper.readValue(response[0].toString(), Vec2::class.java)
            opponentStartingCase = placeService.get1DPosition(startingCase.y, startingCase.x)
            val startingCaseView = boardView.findViewHolderForAdapterPosition(opponentStartingCase!!)?.itemView?.findViewById<ImageView>(R.id.placement_layer)
            if(startingCaseView != null) startingCaseView.background = ContextCompat.getDrawable(startingCaseView.context, R.drawable.starting_case_border)
        }
        socket.on("eraseStartingCase") {
            eraseStartingCase()
        }
    }

    private fun receiveObserverBoard(){
        socket.on("giveBoardToObserver"){ response ->
            val receivedBoard = mapper.readValue(response[0].toString(), object:TypeReference<Array<Array<String>>>(){})
            for(i in 0 until Constants.BOARD_HEIGHT){
                for(j in 0 until Constants.BOARD_HEIGHT){
                    val letterToAdd = Reserve.RESERVE.find{
                        it.value == receivedBoard[i][j].uppercase()
                    }
                    if(letterToAdd != null){
                        val newLetter = Letter(letterToAdd.value,letterToAdd.quantity,letterToAdd.points, letterToAdd.isSelectedForSwap, letterToAdd.isSelectedForManipulation)
                        board[j+Constants.BOARD_HEIGHT* i] = newLetter
                        Log.d("item", newLetter.value)
                    }

                }
            }

            activity?.runOnUiThread {
                boardAdapter.updateData(board)
            }
        }
    }

    private fun eraseStartingCase() {
        if(opponentStartingCase != null) {
            val lastStartingCaseView = boardView.findViewHolderForAdapterPosition(opponentStartingCase!!)?.itemView?.findViewById<ImageView>(R.id.placement_layer)
            if(lastStartingCaseView != null) lastStartingCaseView.background = ContextCompat.getDrawable(lastStartingCaseView.context, R.drawable.board_case_border)
        }
    }


}
