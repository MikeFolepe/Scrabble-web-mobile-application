package com.example.scrabbleprototype.fragments

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.BoardAdapter
import com.example.scrabbleprototype.model.Letter
import com.example.scrabbleprototype.objects.Board


class BoardFragment : Fragment() {

    var board = Board.cases

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

        boardAdapter.onCaseClicked = { position ->
            board[position] = Letter('A', 5, 5, false, false)
            boardAdapter.notifyItemChanged(position)
            Toast.makeText(activity, "Case sélectionnée : " + board[position].value, Toast.LENGTH_LONG).show()
        }
    }

    private fun initializeBoard() {
        for(i in 0..224 ) {
            board.add(Letter(' ', 0, 0, false, false))
        }
    }


}
