package com.example.scrabbleprototype.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.Users

class ConnectionActivity : AppCompatActivity() {
    val users = Users

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_connection)

        val connectionButton = findViewById<Button>(R.id.connection_button)
        connectionButton.setOnClickListener {
            onConnection()
        }
    }

    fun onConnection() {
        val username = findViewById<EditText>(R.id.username)
        val serverIp = findViewById<EditText>(R.id.server_ip)
        //validate username and ip
        users.currentUser = username.text.toString()
        val intent = Intent(this, ChatActivity::class.java)
        startActivity(intent)
    }
}