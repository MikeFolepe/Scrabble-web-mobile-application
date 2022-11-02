package com.example.scrabbleprototype.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.CurrentRoom

class WaitingRoomActivity : AppCompatActivity() {

    var room = CurrentRoom
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.waiting_room)

        setUpButtons()
        }

    private fun setUpButtons(){
        val privateButton = findViewById<Button>(R.id.convert_game)
        privateButton.setOnClickListener {


        }
    }
    }


