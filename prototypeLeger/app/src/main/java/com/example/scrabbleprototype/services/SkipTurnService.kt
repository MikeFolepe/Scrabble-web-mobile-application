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
        activePlayerName = CurrentRoom.myRoom.gameSettings.creatorName
        receiveNewTurn()
        receiveTimer()
        return binder
    }

    fun setTurnUICallback(callBack: TurnUICallback?) {
        turnUICallback = callBack
    }
    fun setEndTurnCallback(callBack: EndTurnCallback?) {
        endTurnCallback = callBack
    }

    private fun receiveNewTurn() {
        socket.on("turnSwitched") { response ->
            val playerName = response[0] as String
            if(player.name == playerName) {
                activePlayerName = playerName
                player.setTurn(true)
            }
            else {
                val activeOpponent: Player = opponents.find { it.name == playerName }!!
                activeOpponent.setTurn(true)
                activePlayerName = activeOpponent.name
            }
        }

        socket.on("updatePlayerTurnToFalse") { response ->
            Log.d("oppTurn", activePlayerName)
            val opponentName = response[0] as String
            opponents.find { it.name == opponentName }?.setTurn(false)
        }
    }

    private fun receiveTimer() {
        socket.on("updateTimer") { response ->
            val minutes: Int = response[0] as Int
            val seconds: Int = response[1] as Int
            timeMs = getTimeMs(minutes, seconds)
            turnUICallback?.updateTimeUI(timeMs, activePlayerName)
        }
    }

    fun switchTimer() {
        Timer().schedule(timerTask {
            endTurnCallback?.handleInvalidPlacement()
            socket.emit("switchTurn", CurrentRoom.myRoom.id, player.name)
            player.setTurn(false)
        }, 1000)
    }

    private fun getTimeMs(minutes: Int, seconds: Int): Long {
        return minutes.toLong() * 1000 * 60 + seconds.toLong() * 1000
    }
}
