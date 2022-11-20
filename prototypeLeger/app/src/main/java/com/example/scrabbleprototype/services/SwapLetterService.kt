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
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.LetterRack
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

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

    fun swapLetters(lettersToSwapIndexes: HashMap<Int, String>) {
        for(key in lettersToSwapIndexes.keys) {
            Log.d("swapkey", key.toString())
        }
        SocketHandler.socket.emit("swap", CurrentRoom.myRoom.id, Json.encodeToString(letterRack), Json.encodeToString(lettersToSwapIndexes.keys.toTypedArray()))
    }
}
