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
    fun updateTimeUI(minutes: String, seconds: String, activePlayerName: String)
}
interface EndTurnCallback {
    fun handleInvalidPlacement()
}
interface CancelSwapCallback {
    fun resetSwap()
}

class SkipTurnService : Service() {

    private val socketHandler = SocketHandler
    private val socket = socketHandler.getPlayerSocket()
    private val player = Players.currentPlayer

    private var activePlayerName: String = ""

    private val binder = LocalBinder()
    private var turnUICallback: TurnUICallback? = null
    private var endTurnCallback: EndTurnCallback? = null
    private var cancelSwapCallback: CancelSwapCallback? = null

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
    fun setCancelSwapCallback(callback: CancelSwapCallback?) {
        cancelSwapCallback = callback
    }

    private fun receiveNewTurn() {
        socket.on("turnSwitched") { response ->
            val playerName = response[0] as String

            if(activePlayerName == player.name) {
                cancelSwapCallback?.resetSwap()
                endTurnCallback?.handleInvalidPlacement()
            }

            if(player.name == playerName) {
                activePlayerName = playerName
                player.setTurn(true)
            }
            val currentPlayer = Players.players.find { it.name == playerName }!!
            currentPlayer.setTurn(true)
            activePlayerName = currentPlayer.name
        }

        socket.on("updatePlayerTurnToFalse") { response ->
            val playerToUpdateName = response[0] as String
            Players.players.find { it.name == playerToUpdateName }?.setTurn(false)
        }
    }

    private fun receiveTimer() {
        socket.on("updateTimer") { response ->
            val minutes = response[0].toString()
            val seconds = response[1].toString()
            Log.d("timer", "on update")
            turnUICallback?.updateTimeUI(minutes, seconds, activePlayerName)
        }
    }

    fun switchTimer() {
        Timer().schedule(timerTask {
            cancelSwapCallback?.resetSwap()
            endTurnCallback?.handleInvalidPlacement()
            socket.emit("switchTurn", CurrentRoom.myRoom.id)
            player.setTurn(false)
        }, 1000)
    }
}
