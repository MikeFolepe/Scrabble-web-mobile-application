package com.example.scrabbleprototype.fragments

import android.content.Context
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.activities.GameActivity
import com.example.scrabbleprototype.model.Letter
import com.example.scrabbleprototype.model.LetterRackAdapter
import com.example.scrabbleprototype.objects.LetterRack

class LetterRackFragment : Fragment() {

    val letterRack = LetterRack.letters

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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

        setupLetterRack(view)
    }

    private fun setupLetterRack(view: View) {
        val letterRackView = view.findViewById<RecyclerView>(R.id.letter_rack)
        val horizontalLayoutManager = LinearLayoutManager(activity, LinearLayoutManager.HORIZONTAL, false)
        letterRackView.layoutManager = horizontalLayoutManager
        val letterRackAdapter = LetterRackAdapter(letterRack)
        letterRackView.adapter = letterRackAdapter

        letterRackAdapter.onLetterClick = { position ->
            // GESTION DU CHEVALET ICI
            Toast.makeText(activity, "Lettre sélectionnée : " + letterRack[position], Toast.LENGTH_LONG).show()
        }
    }
}
