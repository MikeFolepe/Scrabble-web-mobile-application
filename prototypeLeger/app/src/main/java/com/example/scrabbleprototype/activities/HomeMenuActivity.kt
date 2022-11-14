package com.example.scrabbleprototype.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.ListView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.GameListAdapter
import com.example.scrabbleprototype.model.Room
import com.example.scrabbleprototype.model.SocketHandler.playerSocket
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.json.JSONArray
import com.example.scrabbleprototype.objects.ThemeManager

class HomeMenuActivity : AppCompatActivity() {
    var channelsNames = arrayOf("channel1", "channel2", "channel3", "channel4")

    lateinit var adapter: ArrayAdapter<String>
    lateinit var listView: ListView
    lateinit var  alertDialog: AlertDialog.Builder
    lateinit var dialog: AlertDialog

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ThemeManager.setActivityTheme(this)
        setContentView(R.layout.activity_home_menu)

        setupButtons()

        val channelsButton = findViewById<Button>(R.id.channelsButton)
        channelsButton.setOnClickListener(){
            openChannelsDialog()
        }
    }

    private fun setupButtons() {
        val createGameButton = findViewById<Button>(R.id.create_game_button)
        createGameButton.setOnClickListener {
            startActivity(Intent(this, CreateGameActivity::class.java))
            }

        val joinGameButton = findViewById<Button>(R.id.join_games_button)
        joinGameButton.setOnClickListener {
            startActivity(Intent(this, JoinGameActivity::class.java))
            }

        val gameViewButton = findViewById<Button>(R.id.game_view_button)
        gameViewButton.setOnClickListener {
            startActivity(Intent(this, GameActivity::class.java))
        }

        /*val channelsButton = findViewById<Button>(R.id.channelsButton)
        channelsButton.setOnClickListener {
            startActivity(Intent(this, ChatChannelsActivity::class.java))
        }*/
    }

    fun openChannelsDialog() {
        alertDialog = AlertDialog.Builder(this)
        val channelsList: View = layoutInflater.inflate(R.layout.channels_list_dialog, null)
        listView = channelsList.findViewById(R.id.listView)
        adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, channelsNames)
        listView.adapter = adapter
        adapter.notifyDataSetChanged()
        alertDialog.setView(channelsList)
        dialog = alertDialog.create()
        dialog.show()
    }


    private fun receiveChannels(channelsListAdapter: channelsListAdapter) {
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

    fun cancel(view: View) {
        dialog.dismiss()
        Toast.makeText(baseContext, "Dialog closed", Toast.LENGTH_SHORT).show()
    }
}
