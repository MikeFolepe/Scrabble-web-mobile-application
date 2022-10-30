package com.example.scrabbleprototype.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import com.example.scrabbleprototype.R

class WaitingRoomActivity : AppCompatActivity() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.waiting_room)

        setUpButtons()
        }

    private fun setUpButtons(){
        val privateRadioButton = findViewById<Button>(R.id.convert_game)
        privateRadioButton.setOnClickListener {
            val intent = Intent(this, PrivateGamePwd::class.java)
            intent.putExtra("popuptitle", "Veuillez entrer un mot de passe")
            startActivity(intent)

        }
    }
    }


