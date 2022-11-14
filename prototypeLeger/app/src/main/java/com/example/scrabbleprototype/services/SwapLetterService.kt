package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Letter
import com.example.scrabbleprototype.model.LetterRackAdapter
import com.example.scrabbleprototype.objects.LetterRack

class SwapLetterService : Service() {

    private val letterRack = LetterRack.letters
    private val reserve = Constants.RESERVE

    private val binder = LocalBinder()

    inner class LocalBinder: Binder() {
        fun getService(): SwapLetterService = this@SwapLetterService
    }

    override fun onBind(intent: Intent): IBinder {
        return binder
    }

    fun swapLetters(letterPos: HashMap<Int, Letter>, letterRackView: RecyclerView) {
        for((position, letter) in letterPos) {
            letter.quantity = letter.quantity + 1
            letterRack[position] = getRandomLetterFromReserve()
            letterRackView.adapter?.notifyItemChanged(position)
        }
        letterPos.clear()
    }

    private fun getRandomLetterFromReserve(): Letter {
        var letterFromReserve = findRandomLetterFromRes()
        while(letterFromReserve.quantity == 0) letterFromReserve = findRandomLetterFromRes()
        letterFromReserve.quantity -= 1
        return letterFromReserve
    }

    private fun findRandomLetterFromRes() : Letter {
        return reserve[(0..25).shuffled().last()]
    }
}
