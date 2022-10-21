package com.example.scrabbleprototype.activities

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.GameListAdapter
import com.example.scrabbleprototype.model.Message
import com.example.scrabbleprototype.model.Room
import com.example.scrabbleprototype.model.SocketHandler
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray

class JoinGameActivity : AppCompatActivity() {

    var rooms = arrayListOf<Room>()
    val playerSocket = SocketHandler.getPlayerSocket()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_join_game)

        playerSocket.connect()
        Log.d("room", playerSocket.isActive.toString())
        setupGameList()
    }

    private fun setupGameList() {
        playerSocket.on("roomConfiguration"){ response ->
            Log.d("room", "test")
            var roomsAvailable = response[0] as JSONArray
            for(i in 0 until roomsAvailable.length()) {
                Log.d("room", roomsAvailable[i].toString())
            }
            roomsAvailable = roomsAvailable[0] as JSONArray
            for(i in 0 until roomsAvailable.length()) {
                // TODO
                //rooms.add(Json.decodeFromString(Room.serializer(), roomsAvailable.get(i).toString()))
            }
        }

        val gameListView = findViewById<RecyclerView>(R.id.available_games_list)
        val verticalLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        gameListView.layoutManager = verticalLayoutManager
        val gameListAdapter = GameListAdapter(rooms)
        gameListView.adapter = gameListAdapter
        gameListAdapter.updateData(rooms)

        Log.d("room", "emit")
        playerSocket.emit("getRoomsConfiguration")
    }
}
