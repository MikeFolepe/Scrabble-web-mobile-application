package com.example.scrabbleprototype.activities

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.ThemeManager
import com.fasterxml.jackson.core.type.TypeReference
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ThemeManager.setActivityTheme(this)
        setContentView(R.layout.waiting_room)
        receiveNewOpponent()
        goToGameView()
        setupStartGameButton()
        setupRoomId()
        setupPlayersWaiting()
        receiveNewRequest()
    }

    private fun setupStartGameButton() {
        val startGameButton = findViewById<Button>(R.id.start_game_button)
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
            Log.d("roomPlayers", "waiting")
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

    private fun goToGameView() {
        socket.on("goToGameView") {
            startActivity(Intent(this, GameActivity::class.java))
        }
    }
}
