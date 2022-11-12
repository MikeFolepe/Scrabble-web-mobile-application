package com.example.scrabbleprototype.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.ListView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabbleprototype.R

class HomeMenuActivity : AppCompatActivity() {
    var channelsNames = arrayOf("channel1", "channel2", "channel3", "channel4")

    lateinit var adapter: ArrayAdapter<String>
    lateinit var listView: ListView
    lateinit var  alertDialog: AlertDialog.Builder
    lateinit var dialog: AlertDialog

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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

    fun cancel(view: View) {
        dialog.dismiss()
        Toast.makeText(baseContext, "Dialog closed", Toast.LENGTH_SHORT).show()
    }
}
