package com.example.scrabbleprototype.model

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity


class Channel(): AppCompatActivity(){
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        var players: Array<String> = arrayOf<String>()
        var name: String = ""

        fun addPlayer(player: String) {
            players += player
        }
    }
}
