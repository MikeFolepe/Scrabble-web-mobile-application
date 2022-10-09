package com.example.scrabbleprototype.activities

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.fragments.LetterRackFragment

class GameActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        val fragmentTransaction = supportFragmentManager.beginTransaction()
        fragmentTransaction.add(R.id.letter_rack_frame, LetterRackFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }
}
