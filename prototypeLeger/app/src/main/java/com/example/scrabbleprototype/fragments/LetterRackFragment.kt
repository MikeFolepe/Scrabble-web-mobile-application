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
import android.widget.Button
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.activities.GameActivity
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Letter
import com.example.scrabbleprototype.model.LetterRackAdapter
import com.example.scrabbleprototype.objects.LetterRack
import com.example.scrabbleprototype.services.SwapLetterService

class LetterRackFragment : Fragment() {

    private val letterRack = LetterRack.lettersVal
    private val letterInfo = LetterRack.letters
    private val reserve = Constants.RESERVE
    private val hashMap = hashMapOf<Char, Letter>()
    private val letterPos = hashMapOf<Int, Letter>()

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
    }

    override fun onStart() {
        super.onStart()
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
        setupLetterRack(view)
        setupSwapButton(view)
        initializeLetterRack()

        for(element in reserve) {
            hashMap[element.value] = element
        }
    }

    private fun setupLetterRack(view: View) {
        val letterRackView = view.findViewById<RecyclerView>(R.id.letter_rack)
        val horizontalLayoutManager = LinearLayoutManager(activity, LinearLayoutManager.HORIZONTAL, false)
        letterRackView.layoutManager = horizontalLayoutManager
        val letterRackAdapter = LetterRackAdapter(letterInfo)
        letterRackView.adapter = letterRackAdapter
        letterRackAdapter.updateData(letterInfo)

        letterRackAdapter.onLetterClick = { position ->
            // GESTION DU CHEVALET ICI
            Toast.makeText(activity, "Lettre sélectionnée : " + letterRack[position], Toast.LENGTH_LONG).show()
            letterPos[position] = letterInfo[position]
        }
    }

    private fun setupSwapButton(view : View) {
        val swapButton = view.findViewById<Button>(R.id.swap_button)
        val letterRackView = view.findViewById<RecyclerView>(R.id.letter_rack)
        swapButton.setOnClickListener {
            for((position, letter) in letterPos) {
                letter.quantity = letter.quantity.toInt() + 1
                var newLetterFromRes = findRandomLetterFromRes()
                while (newLetterFromRes.quantity == 0) {
                    newLetterFromRes = findRandomLetterFromRes()
                }
                letterRack[position] = newLetterFromRes.value
                letterInfo[position] = newLetterFromRes
                newLetterFromRes.quantity = newLetterFromRes.quantity.toInt() - 1
                val letterRackAdapter = letterRackView.adapter
                if (letterRackAdapter != null) {
                    letterRackAdapter.notifyDataSetChanged()
                }
            }
            letterPos.clear()
            if(swapLetterBound) swapLetterService.testService()
            //le letterRack est updaté au niveau du code, il faut maintenant update au niveau de la vue.

        }
    }

    private fun initializeLetterRack() {
        for (i in 0..6) {

            val letterToAdd = findRandomLetterFromRes()
            while (letterToAdd.quantity == 0) {
                val letterToAdd = findRandomLetterFromRes()
            }
            letterInfo.add(letterToAdd)
            letterRack.add(letterInfo[i].value)

            letterToAdd.quantity = letterToAdd.quantity.toInt() - 1
        }

    }

    private fun findRandomLetterFromRes() : Letter {
        return reserve[(0..25).shuffled().last()]
    }

}
