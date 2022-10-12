package com.example.scrabbleprototype.fragments

import android.content.Context
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.activities.GameActivity
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Letter
import com.example.scrabbleprototype.model.LetterRackAdapter
import com.example.scrabbleprototype.objects.LetterRack

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [LetterRackFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class LetterRackFragment : Fragment() {

    private val letterRack = LetterRack.lettersVal
    private val letterInfo = LetterRack.letters
    private val reserve = Constants.RESERVE
    private val hashMap = hashMapOf<Char, Letter>()

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
        val letterRackView = view.findViewById<RecyclerView>(R.id.letter_rack)
        val horizontalLayoutManager = LinearLayoutManager(activity, LinearLayoutManager.HORIZONTAL, false)
        letterRackView.layoutManager = horizontalLayoutManager

        for (i in 0..6) {

            val letterToAdd = findRandomLetterFromRes()
            while (letterToAdd.quantity == 0) {
                val letterToAdd = findRandomLetterFromRes()
            }
            letterInfo.add(letterToAdd)
            letterRack.add(letterInfo[i].value)

            letterToAdd.quantity = letterToAdd.quantity.toInt() - 1
        }


        val letterRackAdapter = LetterRackAdapter(letterRack)
        letterRackView.adapter = letterRackAdapter

        for(element in reserve) {
            hashMap[element.value] = element
        }
    }

    private fun findRandomLetterFromRes() : Letter {
        return reserve[(0..25).shuffled().last()]
    }












    //randomize function
}
