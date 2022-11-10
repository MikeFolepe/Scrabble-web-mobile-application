package com.example.scrabbleprototype.activities

import android.app.Dialog
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class WaitingRoomActivity : AppCompatActivity() {

    private var playersWaiting = arrayListOf<Player>()
    private lateinit var playersWaitingAdapter: PlayersWaitingAdapter
    val currentRoom = CurrentRoom.myRoom
    private val socket = SocketHandler.getPlayerSocket()
    private val mapper = jacksonObjectMapper()
    val socketHandler = SocketHandler

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.waiting_room)
        receiveNewOpponent()
        goToGameView()
        setupStartGameButton()
        setupRoomId()
        setupPlayersWaiting()
        Log.d("Aaaa", "Before call to receiveNewResquest")
        receiveNewRequest()
    }

    private fun setupStartGameButton() {
        val startGameButton = findViewById<Button>(R.id.start_game_button)
        startGameButton.setOnClickListener {
            Log.d("waiting", Players.currentPlayer.isCreator.toString())
            if(Players.opponents.size < Constants.MAX_OPPONENTS || !Players.currentPlayer.isCreator) {
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

    /*fun setUpGameTypeLabel() {
        val typeText = findViewById<TextView>(R.id.gameTypeLabel)
        if(currentRoom.gameSettings.type == RoomType.public) {
            typeText.text = "PUBLIC"
        }
        else {
            typeText.text = "PRIVÉE"
        }
    }*/

    private fun setupPlayersWaiting() {
        val playersWaitingView = findViewById<RecyclerView>(R.id.players_waiting)

        playersWaiting.add(Players.currentPlayer)
        for(opponent in Players.opponents) { playersWaiting.add(opponent) }

        val verticalLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        playersWaitingView.layoutManager = verticalLayoutManager
        Log.d("waiting", playersWaiting.size.toString())
        playersWaitingAdapter = PlayersWaitingAdapter(playersWaiting)
        playersWaitingView.adapter = playersWaitingAdapter
        playersWaitingAdapter.updateData(playersWaiting)
    }

    private fun receiveNewOpponent() {
        socket.on("Opponent") { response ->
            val newOpponent = mapper.readValue(response[0].toString(), Player::class.java)
            Players.opponents.add(newOpponent)
            runOnUiThread {
                playersWaiting.add(newOpponent)
                Log.d("waiting", playersWaiting[playersWaiting.size - 1].name)
                playersWaitingAdapter.notifyItemChanged(playersWaiting.size - 1)
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
                        socket.emit("sendJoinResponse", false, JSONObject(
                            Json.encodeToString( newPlayer)), roomId)
                        dialog.hide()
                    }
                    }

            }
        }


    private fun goToGameView() {
        socket.on("goToGameView") {
            startActivity(Intent(this, GameActivity::class.java))
        }
    }
}
