package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.Player

class SkipTurnService : Service() {

    private val socketHandler = SocketHandler
    private val playerSocket = socketHandler.getPlayerSocket()
    private val player = Player

    private var timeMs: Long = 0
    private lateinit var countdownTimer: CountDownTimer

    private val binder = LocalBinder()

    inner class LocalBinder: Binder() {
        fun getService(): SkipTurnService = this@SkipTurnService
    }

    override fun onBind(intent: Intent): IBinder {
        receiveNewTurn()
        receiveStartFromServer()
        return binder
    }

    private fun receiveStartFromServer() {
        playerSocket.on("startTimer") {
            if(player.isTurn) {
                Log.d("timer", "Started")
                timeMs = 60000
                updateTimeUI()
                startTimer(timeMs)
            }
        }
    }

    private fun receiveNewTurn() {
        playerSocket.on("turnSwitched") { response ->
            player.isTurn = response[0] as Boolean
            Log.d("timer", player.isTurn.toString())
        }
    }

    fun startTimer(startTime: Long, timeMs: Long ) {

        countdownTimer = object : CountDownTimer(startTime, 1000) {
            override fun onFinish() {
                switchTimer()
            }

            override fun onTick(newTime: Long) {
                timeMs = newTime
                updateTimeUI()
            }
        }
        countdownTimer.start()
    }

    fun switchTimer() {
        resetTimer()
        Thread.sleep(3000)
        Log.d("timer", "Emit du switch")
        playerSocket.emit("switchTurn", player.isTurn, socketHandler.roomId)
        player.isTurn = false
    }

    fun resetTimer() {
        countdownTimer.cancel()
        timeMs = 0
        updateTimeUI()
    }
}
