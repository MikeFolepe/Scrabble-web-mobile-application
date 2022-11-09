package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.*
import android.util.Log
import com.example.scrabbleprototype.model.Player
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import java.util.*
import kotlin.concurrent.timerTask

interface TurnUICallback {
    fun updateTimeUI(currentTime: Long, activePlayerName: String)
}
interface EndTurnCallback {
    fun handleInvalidPlacement()
}

class SkipTurnService : Service() {

    private val socketHandler = SocketHandler
    private val socket = socketHandler.getPlayerSocket()
    private val player = Players.currentPlayer
    private val opponents = Players.opponents

    var timeMs: Long = 0
    private var activePlayerName: String = ""
    private lateinit var countdownTimer: CountDownTimer

    private val binder = LocalBinder()
    private var turnUICallback: TurnUICallback? = null
    private var endTurnCallback: EndTurnCallback? = null

    inner class LocalBinder: Binder() {
        fun getService(): SkipTurnService = this@SkipTurnService
    }

    override fun onBind(intent: Intent): IBinder {
        receiveNewTurn()
        receiveStartFromServer()
        return binder
    }

    fun setTurnUICallback(callBack: TurnUICallback?) {
        turnUICallback = callBack
    }
    fun setEndTurnCallback(callBack: EndTurnCallback?) {
        endTurnCallback = callBack
    }

    private fun receiveStartFromServer() {
        socket.on("startTimer") {
            Log.d("timer", "Started")
            getTurnTime()
            timeMs = 60000
            if(turnUICallback == null) Log.d("timer", "its null")
            turnUICallback?.updateTimeUI(timeMs, activePlayerName)
            startTimer(timeMs)

        }
    }

    private fun receiveNewTurn() {
        socket.on("turnSwitched") { response ->
            val playerName = response[0] as String
            if(player.name == playerName) {
                activePlayerName = playerName
                player.setTurn(true)
                Log.d("timer", "turn is true")
            }
            else {
                val activeOpponent: Player = opponents.find { it.name == playerName }!!
                activeOpponent.setTurn(true)
                activePlayerName = activeOpponent.name
            }
        }

        socket.on("updatePlayerTurnToFalse") { response ->
            resetTimer()
            val opponentName = response[0] as String
            opponents.find { it.name == opponentName }?.setTurn(false)
        }
    }

    fun startTimer(startTime: Long) {
        Handler(Looper.getMainLooper()).post {
            countdownTimer = object : CountDownTimer(startTime, 1000) {
                override fun onFinish() {
                    resetTimer()
                    if(player.getTurn()) switchTimer()
                }

                override fun onTick(newTime: Long) {
                    timeMs = newTime
                    turnUICallback?.updateTimeUI(timeMs, activePlayerName)
                }
            }
            countdownTimer.start()
        }
    }

    fun switchTimer() {
        Timer().schedule(timerTask {
            endTurnCallback?.handleInvalidPlacement()
            Log.d("timer", "Emit du switch")
            socket.emit("switchTurn", CurrentRoom.myRoom.id, player.name)
            player.setTurn(false)
        }, 3000)
    }

    fun resetTimer() {
        countdownTimer.cancel()
        timeMs = 0
        turnUICallback?.updateTimeUI(timeMs, activePlayerName)
    }

    private fun getTurnTime() {
        Log.d("turnTime", CurrentRoom.myRoom.gameSettings.timeMinute + " " + CurrentRoom.myRoom.gameSettings.timeSecond)
    }
}
