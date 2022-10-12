package com.example.scrabbleprototype.activities

import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.LinearLayout
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.fragments.*

class GameActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
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

        setUpFragments()
    }

    private fun setUpFragments() {
        val fragmentTransaction = supportFragmentManager.beginTransaction()
        fragmentTransaction.add(R.id.letter_rack_frame, LetterRackFragment())
        fragmentTransaction.add(R.id.game_buttons_frame, GameButtonsFragment())
        fragmentTransaction.add(R.id.chatbox_frame, ChatFragment())
        fragmentTransaction.add(R.id.info_pannel_frame, InformationPannelFragment())
        fragmentTransaction.add(R.id.board_frame, BoardFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        if(this.currentFocus?.windowToken != null) imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }
}
