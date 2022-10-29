package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.*
import android.util.Log
import androidx.databinding.ObservableField
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.Player

interface SkipTurnCallback {
    fun updateTimeUI(currentTime: Long)
}

class SkipTurnService : Service() {

    private val socketHandler = SocketHandler
    private val playerSocket = socketHandler.getPlayerSocket()
    private val player = Player

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
        playerSocket.on("startTimer") {
            if(player.getTurn()) {
                Log.d("timer", "Started")
                timeMs = 60000
                skipTurnCallBack?.updateTimeUI(timeMs)
                startTimer(timeMs)
            }
        }
    }

    private fun receiveNewTurn() {
        playerSocket.on("turnSwitched") { response ->
            player.setTurn(response[0] as Boolean)
            Log.d("timer", player.getTurn().toString())
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
        playerSocket.emit("switchTurn", player.getTurn(), socketHandler.roomId)
        player.setTurn(false)
    }

    fun resetTimer() {
        countdownTimer.cancel()
        timeMs = 0
        skipTurnCallBack?.updateTimeUI(timeMs)
    }
}
