package com.example.scrabbleprototype.model

import java.util.*
import kotlinx.serialization.Serializable
import java.text.SimpleDateFormat

@Serializable
class Message(var message: String, var messageUser: String) {

    var messageTime: String = getTimestamp()

    fun getTimestamp(): String {
        val time = Date().time
        val timestampFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        return timestampFormat.format(time)
    }
}
