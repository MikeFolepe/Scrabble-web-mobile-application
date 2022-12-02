package com.example.scrabbleprototype.model

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import kotlinx.serialization.Serializable
import java.text.SimpleDateFormat
import java.util.*

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

    fun getAvatarBitmap():Bitmap{
        val split = avatar.split(",")
        val imageBytes = Base64.decode(split[1], Base64.NO_WRAP)
        return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
    }
}
