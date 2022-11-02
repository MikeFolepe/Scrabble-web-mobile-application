package com.example.scrabbleprototype.model

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


class Channel(): AppCompatActivity(){
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val players: Array<String>
        val name: String = ""

        fun addPlayer(player: String) {
            players.add(player)
        }
    }
}
