package com.example.scrabbleprototype.fragments

import android.os.Bundle
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
import com.example.scrabbleprototype.viewModel.PlacementViewModel


class BoardFragment : Fragment() {

    var board = Board.cases
    var letterRack = LetterRack.letters

    private val placementViewModel: PlacementViewModel by activityViewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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

        setupBoard(view)
    }

    private fun setupBoard(view: View) {
        initializeBoard()
        val boardView = view.findViewById<RecyclerView>(R.id.board)
        val gridLayoutManager = GridLayoutManager(activity, 15, GridLayoutManager.VERTICAL, false)
        boardView.layoutManager = gridLayoutManager
        val boardAdapter = BoardAdapter(board)
        boardView.adapter = boardAdapter
        boardAdapter.updateData(board)

        boardAdapter.onPlacement = { letterRackPosition, boardPosition ->
            placementViewModel.addLetter(boardPosition, board[boardPosition].value)

            letterRack.removeAt(letterRackPosition)
            val letterRackAdapter = activity?.findViewById<RecyclerView>(R.id.letter_rack)?.adapter
            letterRackAdapter?.notifyDataSetChanged()
            Log.d("placing", letterRack.size.toString())
        }
    }

    private fun initializeBoard() {
        for(i in 0..224 ) {
            board.add(Constants.EMPTY_LETTER)
        }
    }



}
