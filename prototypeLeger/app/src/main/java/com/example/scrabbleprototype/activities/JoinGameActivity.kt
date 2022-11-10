package com.example.scrabbleprototype.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.LinearLayout
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.Reserve
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.google.android.material.snackbar.Snackbar
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray

class JoinGameActivity : AppCompatActivity() {

    var rooms = arrayListOf<Room>()
    val socketHandler = SocketHandler
    val socket = socketHandler.getPlayerSocket()
    private val mapper = jacksonObjectMapper()
    val currentUser = Users.currentUser

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_join_game)

        receiveOpponents()
        receiveRoomId()
        receiveMyPlayer()
        receiveNewOpponent()
        receiveGameSettings()
        routeToWaitingRoom()
        setupGameList()
        receiveJoinDecision()
    }

    private fun setupGameList() {

        val gameListView = findViewById<RecyclerView>(R.id.available_games_list)
        val verticalLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        gameListView.layoutManager = verticalLayoutManager
        val gameListAdapter = GameListAdapter(rooms)
        gameListView.adapter = gameListAdapter
        gameListAdapter.updateData(rooms)

        gameListAdapter.onJoinGame = { position ->
            joinGame(position)
        }
        receiveRooms(gameListAdapter)
        handleRoomUnavailability()
        routeToGameView()
    }

    private fun joinGame(position: Int) {
        Log.d("room", rooms.toString())
        val currentRoom = rooms[position]
        if (currentRoom.gameSettings.type == RoomType.public) {
            socket.emit("newRoomCustomer", Users.currentUser, rooms[position].id)
            socketHandler.roomId = rooms[position].id
        }
        else {
            socket.emit("sendRequestToCreator", Users.currentUser, currentRoom.id)
            socketHandler.roomId = rooms[position].id
        }
    }

    private fun currRoom() {
        socket.on("yourRoom") {response ->

        }
    }

    private fun receiveRooms(gameListAdapter: GameListAdapter) {
        socket.on("roomConfiguration"){ response ->
            rooms = mapper.readValue(response[0].toString(), object: TypeReference<ArrayList<Room>>() {})
            Log.d("receiveRooms", rooms[0].id.toString())
            runOnUiThread {
                gameListAdapter.updateData(rooms)
            }
        }
        socket.emit("getRoomsConfiguration")
    }

    private fun receiveOpponents() {
        socket.on("curOps") { response ->
            val opponentsString = response[0].toString()
            Players.opponents = mapper.readValue(opponentsString, object: TypeReference<ArrayList<Player>>() {})
        }
    }

    private fun receiveRoomId() {
        socket.on("yourRoomId") { response ->
            val roomId = response[0] as String
            SocketHandler.roomId = roomId
        }
    }

    private fun receiveMyPlayer() {
        socket.on("MyPlayer") { response ->
            Players.currentPlayer = mapper.readValue(response[0].toString(), Player::class.java)
        }
    }



    private fun receiveNewOpponent() {
        socket.on("Opponent") { response ->
            Players.opponents.add(mapper.readValue(response[0].toString(), Player::class.java))
        }
    }

    private fun receiveJoinDecision() {
        socket.on("receiveJoinDecision") { response ->

            val decision = mapper.readValue(response[0].toString(), Boolean::class.java)
            val roomId = mapper.readValue(response[1].toString(), String::class.java)
            if (decision) {
                socket.emit("newRoomCustomer", currentUser, roomId)
            }
            else {
                Snackbar.make(findViewById<LinearLayout>(R.id.snackbar_text), "Demande rejetée par le créateur", Snackbar.LENGTH_LONG).show()
            }
        }
    }
    private fun receiveGameSettings() {
        socket.on("yourGameSettings") { response ->
            val gameSettings = mapper.readValue(response[0].toString(), GameSettings::class.java)
            CurrentRoom.myRoom = Room(SocketHandler.roomId, arrayListOf(), gameSettings, State.Playing, 3,1 , arrayListOf())
        }
    }

    private fun handleRoomUnavailability() {
        socket.on("roomAlreadyToken") {
            Toast.makeText(this, "Il est impossible de joindre cette partie", Toast.LENGTH_LONG).show()
        }
    }

    private fun routeToGameView() {
        socket.on("goToGameView") {
            startActivity(Intent(this, GameActivity::class.java))
        }
    }

    private fun routeToWaitingRoom() {
        socket.on("goToWaiting") {
            startActivity(Intent(this, WaitingRoomActivity::class.java))
        }
    }
}
