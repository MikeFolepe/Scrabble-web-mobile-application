package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.*
import android.util.Log
import androidx.databinding.ObservableField
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players

interface SkipTurnCallback {
    fun updateTimeUI(currentTime: Long)
}

class SkipTurnService : Service() {

    private val socketHandler = SocketHandler
    private val socket = socketHandler.getPlayerSocket()
    private val player = Players.currentPlayer
    private val opponents = Players.opponents

    private var timeMs: Long = 0
    private lateinit var countdownTimer: CountDownTimer

    private val binder = LocalBinder()
    private var skipTurnCallBack: SkipTurnCallback? = null

    inner class LocalBinder: Binder() {
        fun getService(): SkipTurnService = this@SkipTurnService
    }

    override fun onBind(intent: Intent): IBinder {
        receiveNewTurn()
        receiveStartFromServer()
        return binder
    }

    fun setCallbacks(callBack: SkipTurnCallback?) {
        skipTurnCallBack = callBack
    }

    private fun receiveStartFromServer() {
        socket.on("startTimer") {
            if(player.getTurn()) {
                Log.d("timer", "Started")
                getTurnTime()
                timeMs = 60000
                skipTurnCallBack?.updateTimeUI(timeMs)
                startTimer(timeMs)
            }
        }
    }

    private fun receiveNewTurn() {
        socket.on("turnSwitched") { response ->
            val playerName = response[0] as String
            if(player.name == playerName) player.setTurn(true)
            else {
                opponents.find { it.name == playerName }?.setTurn(true)
            }
        }

        socket.on("updatePlayerTurnToFalse") { response ->
            val opponentName = response[0] as String
            opponents.find { it.name == opponentName }?.setTurn(false)
        }
    }

    fun startTimer(startTime: Long) {
        Handler(Looper.getMainLooper()).post {
            countdownTimer = object : CountDownTimer(startTime, 1000) {
                override fun onFinish() {
                    switchTimer()
                }

                override fun onTick(newTime: Long) {
                    timeMs = newTime
                    skipTurnCallBack?.updateTimeUI(timeMs)
                }
            }
            countdownTimer.start()
        }
    }

    fun switchTimer() {
        resetTimer()
        Thread.sleep(3000)
        Log.d("timer", "Emit du switch")
        socket.emit("switchTurn", socketHandler.roomId, player.name)
        player.setTurn(false)
    }

    fun resetTimer() {
        countdownTimer.cancel()
        timeMs = 0
        skipTurnCallBack?.updateTimeUI(timeMs)
    }

    private fun getTurnTime() {
        Log.d("turnTime", CurrentRoom.myRoom.gameSettings.timeMinute + " " + CurrentRoom.myRoom.gameSettings.timeSecond)
    }
}
