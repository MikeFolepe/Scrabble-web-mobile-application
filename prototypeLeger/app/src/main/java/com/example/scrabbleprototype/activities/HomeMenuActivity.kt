package com.example.scrabbleprototype.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.ThemeManager

class HomeMenuActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_menu)

        //setupButtons()
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
    }
}
