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
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray

class JoinGameActivity : AppCompatActivity() {

    var rooms = arrayListOf<Room>()
    val socketHandler = SocketHandler
    val playerSocket = socketHandler.getPlayerSocket()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_join_game)

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
        routeToGameView()
    }

    private fun joinGame(position: Int) {
        Log.d("room", rooms[position].id)
        playerSocket.emit("newRoomCustomer", Users.currentUser, rooms[position].id)
        socketHandler.roomId = rooms[position].id
    }

    private fun receiveRooms(gameListAdapter: GameListAdapter) {
        playerSocket.on("roomConfiguration"){ response ->
            var roomsAvailable = response[0] as JSONArray
            for(i in 0 until roomsAvailable.length()) {
                Log.d("room", roomsAvailable[i].toString())
            }
            roomsAvailable = roomsAvailable[0] as JSONArray
            for(i in 0 until roomsAvailable.length()) {
                val mapper = jacksonObjectMapper()
                val roomToAdd = mapper.readValue(roomsAvailable.get(i).toString(), Room::class.java)
                rooms.add(roomToAdd)
            }
            runOnUiThread {
                gameListAdapter.updateData(rooms)
            }
        }
        playerSocket.emit("getRoomsConfiguration")
    }

    private fun handleRoomUnavailability() {
        playerSocket.on("roomAlreadyToken") {
            Toast.makeText(this, "Il est impossible de joindre cette partie", Toast.LENGTH_LONG).show()
        }
    }

    private fun routeToGameView() {
        playerSocket.on("goToGameView") {
            startActivity(Intent(this, GameActivity::class.java))
        }
    }
}
