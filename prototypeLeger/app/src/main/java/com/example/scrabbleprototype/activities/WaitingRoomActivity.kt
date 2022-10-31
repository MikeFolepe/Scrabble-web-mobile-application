package com.example.scrabbleprototype.activities

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
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Player
import com.example.scrabbleprototype.model.PlayersWaitingAdapter
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

class WaitingRoomActivity : AppCompatActivity() {

    private var playersWaiting = arrayListOf<Player>()
    private lateinit var playersWaitingAdapter: PlayersWaitingAdapter

    private val socket = SocketHandler.getPlayerSocket()
    private val mapper = jacksonObjectMapper()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.waiting_room)
        receiveNewOpponent()
        goToGameView()
        setupStartGameButton()
        setupRoomId()
        setupPlayersWaiting()
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

    private fun goToGameView() {
        socket.on("goToGameView") {
            startActivity(Intent(this, GameActivity::class.java))
        }
    }
}
