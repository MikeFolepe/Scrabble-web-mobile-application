package com.example.scrabbleprototype.model

import java.text.SimpleDateFormat
import java.util.*

enum class NotifType {
    Friend,
    Game,
    Message,
}

class Notification(var type: NotifType, var sender: String, var description: String) {
    var title: String
    var date: String = getDateStamp()
    var time: String = getTimestamp()

    init {
        when(type) {
            NotifType.Friend -> {
                title = "Invitation d'ami"
            }
            NotifType.Game -> {
                title = "Invitation à une partie"
            }
            NotifType.Message -> {
                title = "Nouveau message"
            }
        }
    }
    fun getDateStamp(): String {
        val dateFormat = SimpleDateFormat("dd/M/yy", Locale.getDefault())
        return dateFormat.format(Date())
    }

    fun getTimestamp(): String {
        val time = Date().time
        val timestampFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        return timestampFormat.format(time)
    }
}
