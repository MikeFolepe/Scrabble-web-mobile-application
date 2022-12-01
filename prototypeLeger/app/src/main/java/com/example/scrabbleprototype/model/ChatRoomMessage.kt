package com.example.scrabbleprototype.model

import android.graphics.Bitmap
import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import kotlinx.serialization.Serializable
import java.text.SimpleDateFormat

@Serializable
enum class MessageType {
    System,
    Opponent,
    Player,
    Error,
}

@Serializable
class ChatRoomMessage(var text: String, var avatar: String ,var pseudonym: String) {

    var type: MessageType = MessageType.Player
    var time: String = getTimestamp()

     fun getTimestamp(): String {
        val time = Date().time
        val timestampFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        return timestampFormat.format(time)
    }
}
