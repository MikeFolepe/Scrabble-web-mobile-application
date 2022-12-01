package com.example.scrabbleprototype.activities

import android.app.Dialog
import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.AttributeSet
import android.util.Log
import android.view.ContextThemeWrapper
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.viewModels
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.fragments.*
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.*
import com.example.scrabbleprototype.viewModel.PreferenceViewModel
import com.example.scrabbleprototype.viewModel.StatsViewmodel
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import java.util.*
import kotlin.collections.ArrayList
import kotlin.concurrent.timerTask

class GameActivity : AppCompatActivity() {
    private lateinit var endGameDialog: Dialog
    private lateinit var endGameAdapter: EndGameAdapter

    private val statsViewModel: StatsViewmodel by viewModels()
    private val socket = SocketHandler.getPlayerSocket()
    private val mapper = jacksonObjectMapper()

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        findViewById<ConstraintLayout>(R.id.game_layout).setOnTouchListener { v, event ->
            when (event?.action) {
                MotionEvent.ACTION_DOWN -> {
                    hideKeyboard()
                }
            }
            v?.onTouchEvent(event) ?: true
        }
        setupEndGameDialog()
        switchAiTurn()
        receiveReserve()
        receiveEndGame()
        leave()
        if(savedInstanceState == null) {
            setUpFragments()
        }
    }

    private fun setUpFragments() {
        val fragmentTransaction = supportFragmentManager.beginTransaction()
        fragmentTransaction.add(R.id.letter_rack_frame, LetterRackFragment())
        fragmentTransaction.add(R.id.game_buttons_frame, GameButtonsFragment())
        fragmentTransaction.add(R.id.chatbox_frame, ChatFragment())
        fragmentTransaction.add(R.id.info_pannel_frame, InformationPannelFragment())
        fragmentTransaction.add(R.id.board_frame, BoardFragment())
        fragmentTransaction.add(R.id.features_frame, FeaturesFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    private fun setupEndGameDialog() {
        endGameDialog = Dialog(ContextThemeWrapper(this, ThemeManager.getTheme()))
        endGameDialog.setContentView(R.layout.dialog_endgame)

        val endGamePlayersView = endGameDialog.findViewById<RecyclerView>(R.id.endgame_players)
        val horizontalLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        endGamePlayersView.layoutManager = horizontalLayoutManager
        endGameAdapter = EndGameAdapter(Players.players)
        endGamePlayersView.adapter = endGameAdapter

        val leaveButton = endGameDialog.findViewById<Button>(R.id.leave_endgame_button)
        leaveButton.setOnClickListener {
            startActivity(Intent(this, MainMenuActivity::class.java))
            endGameDialog.dismiss()
        }
    }

    private fun receiveReserve() {
        socket.on("receiveReserve") { response ->
            Reserve.RESERVE = mapper.readValue(response[0].toString(), object : TypeReference<Array<Letter>>() {})
            Reserve.setReserveSize(Reserve.RESERVE.sumOf { it.quantity })
        }
    }

    private fun switchAiTurn() {
        socket.on("switchAiTurn") {
            socket.emit("switchTurn", CurrentRoom.myRoom.id)
        }
    }

    private fun receiveEndGame() {
        socket.on("receiveEndGame") { response ->
            val winnerName = response[0] as String
            val startDate = response[1] as String
            val startTime = response[2] as String

            val gameEnded = Game(startDate, startTime, winnerName)
            Users.userStats.gamesPlayed += 1
            statsViewModel.saveNewGame(gameEnded)
            statsViewModel.updateGamesPlayed(Users.userStats.gamesPlayed)
            statsViewModel.saveScore(Players.currentPlayer.score)
            if(Users.currentUser.pseudonym == winnerName) {
                Users.userStats.gamesWon += 1
                statsViewModel.updateGamesWon(Users.userStats.gamesWon)
            }

            val playersSorted = ArrayList(Players.players.sortedByDescending { it.score })
            updateXp(playersSorted)
            runOnUiThread {
                endGameAdapter.updateData(playersSorted)
                endGameDialog.show()
            }
        }
    }

    private fun leave() {
        socket.on("leave") {
            Users.currentUser.isObserver = false
            runOnUiThread { startActivity(Intent(this, MainMenuActivity::class.java)) }
        }
    }

    private fun updateXp(players: ArrayList<Player>) {
        when(players.indexOfFirst { it.name == Users.currentUser.pseudonym }) {
            0 -> Users.currentUser.xpPoints += 75
            1 -> Users.currentUser.xpPoints += 40
            2 -> Users.currentUser.xpPoints += 25
            3 -> Users.currentUser.xpPoints += 10
        }
        statsViewModel.saveXp()
    }

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        if(this.currentFocus?.windowToken != null) imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }
}
