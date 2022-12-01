package com.example.scrabbleprototype.activities

import android.content.Context
import android.os.Bundle
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.fragments.*
import com.example.scrabbleprototype.model.Letter
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Reserve
import com.example.scrabbleprototype.objects.ThemeManager
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

class GameActivity : AppCompatActivity() {
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

        switchAiTurn()
        receiveReserve()
        if(savedInstanceState == null) {
            setupFragments()
        }
    }

    private fun setupFragments() {
        val fragmentTransaction = supportFragmentManager.beginTransaction()
        fragmentTransaction.add(R.id.letter_rack_frame, LetterRackFragment())
        fragmentTransaction.add(R.id.game_buttons_frame, GameButtonsFragment())
        fragmentTransaction.add(R.id.chatbox_frame, ChatFragment())
        fragmentTransaction.add(R.id.info_pannel_frame, InformationPannelFragment())
        fragmentTransaction.add(R.id.board_frame, BoardFragment())
        fragmentTransaction.add(R.id.game_chatroom_buttons, ChannelButtonsFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
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

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        if(this.currentFocus?.windowToken != null) imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }
}
