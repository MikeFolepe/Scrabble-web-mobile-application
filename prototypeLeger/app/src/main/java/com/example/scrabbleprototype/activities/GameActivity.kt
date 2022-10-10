package com.example.scrabbleprototype.activities

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.fragments.ChatFragment
import com.example.scrabbleprototype.fragments.GameButtonsFragment
import com.example.scrabbleprototype.fragments.LetterRackFragment

class GameActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        setUpFragments()
    }

    private fun setUpFragments() {
        val fragmentTransaction = supportFragmentManager.beginTransaction()
        fragmentTransaction.add(R.id.letter_rack_frame, LetterRackFragment())
        fragmentTransaction.add(R.id.game_buttons_frame, GameButtonsFragment())
        fragmentTransaction.add(R.id.chatbox_frame, ChatFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }
}
