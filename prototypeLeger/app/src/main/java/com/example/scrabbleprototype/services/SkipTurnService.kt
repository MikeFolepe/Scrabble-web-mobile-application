package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.*
import android.util.Log
import com.example.scrabbleprototype.model.Player
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.Users
import java.util.*
import kotlin.concurrent.timerTask

interface TurnUICallback {
    fun updateTimeUI(minutes: String, seconds: String, activePlayerName: String)
}
interface EndTurnCallback {
    fun handleInvalidPlacement()
}
interface ObserverRackCallback {
    fun switchRack(activePlayerName: String)
}
interface CancelSwapCallback {
    fun resetSwap()
}

class SkipTurnService : Service() {

    private val socketHandler = SocketHandler
    private val socket = socketHandler.getPlayerSocket()
    private val player = Players.currentPlayer

    var activePlayerName: String = ""

    private val binder = LocalBinder()
    private var turnUICallback: TurnUICallback? = null
    private var endTurnCallback: EndTurnCallback? = null
    private var observerRackCallback: ObserverRackCallback? = null
    private var cancelSwapCallback: CancelSwapCallback? = null

    inner class LocalBinder: Binder() {
        fun getService(): SkipTurnService = this@SkipTurnService
    }

    override fun onBind(intent: Intent): IBinder {
        activePlayerName = Players.getActivePlayer().name
        receiveNewTurn()
        return binder
    }

    fun setTurnUICallback(callBack: TurnUICallback?) {
        turnUICallback = callBack
    }
    fun setEndTurnCallback(callBack: EndTurnCallback?) {
        endTurnCallback = callBack
    }
    fun setObserverRackCallback(callBack: ObserverRackCallback?) {
        observerRackCallback = callBack
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
            if(Users.currentUser.isObserver) observerRackCallback?.switchRack(activePlayerName)
        }

        socket.on("updatePlayerTurnToFalse") { response ->
            val playerToUpdateName = response[0] as String
            if(player.name == playerToUpdateName) player.setTurn(false)
            Players.players.find { it.name == playerToUpdateName }?.setTurn(false)
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
