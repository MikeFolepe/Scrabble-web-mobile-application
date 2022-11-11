package com.example.scrabbleprototype.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
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
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray

class JoinGameActivity : AppCompatActivity() {

    var rooms = arrayListOf<Room>()
    val socketHandler = SocketHandler
    val socket = socketHandler.getPlayerSocket()
    private val mapper = jacksonObjectMapper()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_join_game)

        receiveOpponents()
        receiveRoomId()
        receiveMyPlayer()
        receiveGameSettings()
        routeToWaitingRoom()
        setupGameList()
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
    }

    private fun joinGame(position: Int) {
        Log.d("room", rooms[position].id)
        socket.emit("newRoomCustomer", Users.currentUser, rooms[position].id)
        socketHandler.roomId = rooms[position].id
    }

    private fun receiveRooms(gameListAdapter: GameListAdapter) {
        socket.on("roomConfiguration"){ response ->
            rooms = mapper.readValue(response[0].toString(), object: TypeReference<ArrayList<Room>>() {})
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

    private fun receiveGameSettings() {
        socket.on("yourGameSettings") { response ->
            val gameSettings = mapper.readValue(response[0].toString(), GameSettings::class.java)
            CurrentRoom.myRoom = Room(SocketHandler.roomId, arrayListOf(), gameSettings, State.Playing)
        }
    }

    private fun handleRoomUnavailability() {
        socket.on("roomAlreadyToken") {
            Toast.makeText(this, "Il est impossible de joindre cette partie", Toast.LENGTH_LONG).show()
        }
    }

    private fun routeToWaitingRoom() {
        socket.on("goToWaiting") {
            startActivity(Intent(this, WaitingRoomActivity::class.java))
        }
    }
}
