package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable
import java.text.SimpleDateFormat
import java.util.*

@Serializable
class Notification(var type: Int, var sender: String, var description: String) {
    var title: String = ""
    var date: String = getDateStamp()
    var time: String = getTimeStamp()

    init {
        when(type) {
            0 -> {
                title = "Invitation d'ami"
            }
            1 -> {
                title = "Nouveau message"
            }
        }
    }
    fun getDateStamp(): String {
        val dateFormat = SimpleDateFormat("dd/M/yy", Locale.getDefault())
        return dateFormat.format(Date())
    }

    fun getTimeStamp(): String {
        val time = Date().time
        val timestampFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        return timestampFormat.format(time)
    }
}
