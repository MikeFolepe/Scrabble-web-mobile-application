package com.example.scrabbleprototype.activities

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.fragments.ChannelButtonsFragment
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.ThemeManager
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.util.*
import kotlin.collections.ArrayList
import kotlin.concurrent.timerTask

class WaitingRoomActivity : AppCompatActivity() {

    private var playersWaiting = arrayListOf<Player>()
    private lateinit var playersWaitingAdapter: PlayersWaitingAdapter
    val currentRoom = CurrentRoom.myRoom
    private val socket = SocketHandler.getPlayerSocket()
    private val mapper = jacksonObjectMapper()
    val currentPlayer = Players.currentPlayer

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.waiting_room)
        receiveNewOpponent()
        goToGameView()
        setupStartGameButton()
        setupCancelButton()
        setupRoomId()
        setupPlayersWaiting()
        receiveNewRequest()
        leave()
        leaveToHome()
        leaveNotification()
        onReplaceHuman()
        // Players.currentPlayerPosition = Players.opponents.size

        if(savedInstanceState == null) {
            setupFragments()
        }
    }

    private fun setupFragments() {
        val fragmentTransaction = supportFragmentManager.beginTransaction()
        fragmentTransaction.add(R.id.waiting_room_chatroom_buttons, ChannelButtonsFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    private fun setupStartGameButton() {
        val startGameButton = findViewById<Button>(R.id.start_game_button)
        if(!currentPlayer.isCreator){
            startGameButton.setVisibility(View.INVISIBLE)
        }
        startGameButton.setOnClickListener {
            if((CurrentRoom.myRoom.humanPlayersNumber + CurrentRoom.myRoom.aiPlayersNumber) < Constants.MAX_PLAYERS || !Players.currentPlayer.isCreator) {
                Toast.makeText(this, "La partie ne peut pas être commencée", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            socket.emit("startGame", CurrentRoom.myRoom.id)
        }
    }

    private fun setupRoomId() {
        val roomIdText = findViewById<TextView>(R.id.roomId)
        roomIdText.text = "Salle de jeu : " + CurrentRoom.myRoom.id
    }

    private fun setupCancelButton(){
        val cancelGameButton = findViewById<Button>(R.id.back_button)

        if(currentPlayer.isCreator){
            cancelGameButton.text="Annuler"
            cancelGameButton.setOnClickListener {
                socket.emit("deleteGame", currentPlayer.name, CurrentRoom.myRoom.id)
            }

        }else{
            cancelGameButton.text = "Quitter la partie"
            cancelGameButton.setOnClickListener {
                socket.emit("sendLeaveGame", currentPlayer.name, currentRoom.id)
                Players.currentPlayer = Player()
            }
        }
    }

    /*fun setupGameTypeLabel() {
        val typeText = findViewById<TextView>(R.id.room_type)
        if(currentRoom.gameSettings.password == "") {
            typeText.text = "PUBLIC"
            typeText.background = "reen"

        }
        else {
            typeText.text = "PRIVÉE"
        }
    */

    private fun setupPlayersWaiting() {
        val playersWaitingView = findViewById<RecyclerView>(R.id.players_waiting)
        val verticalLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        playersWaitingView.layoutManager = verticalLayoutManager
        playersWaitingAdapter = PlayersWaitingAdapter(Players.players)
        playersWaitingView.adapter = playersWaitingAdapter
        playersWaitingAdapter.updateData(Players.players)
    }

    private fun receiveNewOpponent() {
        socket.on("Opponent") { response ->
            val newOpponent = mapper.readValue(response[0].toString(), Player::class.java)
            val index = response[1] as Int
            Players.opponents[index]= newOpponent
            runOnUiThread {
                playersWaiting.add(newOpponent)
                playersWaitingAdapter.notifyItemChanged(playersWaiting.size - 1)
            }
        }
        socket.on("roomPlayers") { response ->
            Players.players = mapper.readValue(response[0].toString(), object: TypeReference<ArrayList<Player>>() {})
            runOnUiThread {
                playersWaitingAdapter.updateData(Players.players)
            }
        }
    }

    private fun receiveNewRequest() {
        socket.on("newRequest") { response ->
            runOnUiThread {
                var dialog = Dialog(this)
                dialog.setContentView(R.layout.player_request_game)
                Log.d("response", response[1].toString())
                val newPlayer = mapper.readValue(response[0].toString(), User::class.java) as User
                val roomId = response[1].toString()
                val message = dialog.findViewById<TextView>(R.id.popup_window_text)
                message.text = newPlayer.pseudonym + " souhaite rejoindre la partie"
                dialog.show()
                val acceptButton = dialog.findViewById<Button>(R.id.accept_button)
                acceptButton.setOnClickListener {
                    Log.d("button", "accept")
                    socket.emit("sendJoinResponse", true, JSONObject(
                        Json.encodeToString(newPlayer)), roomId)
                    dialog.hide()
                }
                val denyButton = dialog.findViewById<Button>(R.id.deny_button)
                denyButton.setOnClickListener {
                    socket.emit("sendJoinResponse", false, JSONObject(Json.encodeToString(newPlayer)), roomId)
                    dialog.hide()
                }
            }

        }
    }

    private fun leave() {
        socket.on("leave") {
            runOnUiThread { startActivity(Intent(this, MainMenuActivity::class.java)) }
        }
    }

    private fun leaveNotification() {
        socket.on("leaveNotification") { response ->
            val notification = response[0] as String
            runOnUiThread {
                findViewById<TextView>(R.id.leave_notification).text = notification
                Timer().schedule(timerTask {
                    findViewById<TextView>(R.id.leave_notification).text = ""
                }, 4000)
            }
        }
    }

    private fun leaveToHome() {
        socket.on("leaveToHome") {
            runOnUiThread{
                Toast.makeText(this, "La partie a été supprimée par le créateur", Toast.LENGTH_LONG).show()
                startActivity(Intent(this, MainMenuActivity::class.java))
            }

        }
    }

    private fun goToGameView() {
        socket.on("goToGameView") {
            startActivity(Intent(this, GameActivity::class.java))
        }
    }

    private fun onReplaceHuman() {
        socket.on("newPlayerAi") { response ->
            val playerReceived = mapper.readValue(response[0].toString(), Player::class.java)
            val index = mapper.readValue(response[1].toString(), Int::class.java)

            runOnUiThread {
                Players.players[index] = playerReceived
                playersWaitingAdapter.notifyItemChanged(index)
            }
        }
    }
}
