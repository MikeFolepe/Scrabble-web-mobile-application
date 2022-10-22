package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import android.util.Log
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Letter
import com.example.scrabbleprototype.model.LetterRackAdapter

class SwapLetterService : Service() {

    private val binder = LocalBinder()
    private val reserve = Constants.RESERVE

    inner class LocalBinder: Binder() {
        fun getService(): SwapLetterService = this@SwapLetterService
    }

    override fun onBind(intent: Intent): IBinder {
        return binder
    }

    fun swapLetters(letterRack: ArrayList<Letter>, letterPos: HashMap<Int, Letter>, letterRackView: RecyclerView) {
        for((position, letter) in letterPos) {
            letter.quantity = letter.quantity.toInt() + 1
            var newLetterFromRes = findRandomLetterFromRes()
            while (newLetterFromRes.quantity == 0) {
                newLetterFromRes = findRandomLetterFromRes()
            }
            letterRack[position] = newLetterFromRes
            newLetterFromRes.quantity = newLetterFromRes.quantity.toInt() - 1
            val letterRackAdapter = letterRackView.adapter
            if (letterRackAdapter != null) {
                letterRackAdapter.notifyItemChanged(position)
            }
        }
        letterPos.clear()
    }

    private fun findRandomLetterFromRes() : Letter {
        return reserve[(0..25).shuffled().last()]
    }
}
