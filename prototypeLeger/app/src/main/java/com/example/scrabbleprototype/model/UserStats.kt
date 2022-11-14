package com.example.scrabbleprototype.model

import android.util.Log

class UserStats {
    var gamesPlayed: Int = 0
    var gamesWon: Int = 0
    var totalPoints: Int = 0
    var totalTimeMS: Int = 0

    var averagePoints: Int = 0
    var averageTime: Int = 0

    var logins = arrayListOf<Connection>()
    var logouts = arrayListOf<Connection>()

    var games = arrayListOf<Game>()

    @JvmName("getUserAveragePoints")
    fun getAveragePoints(): Int {
        return totalPoints / gamesPlayed
    }

    @JvmName("getUserAverageTime")
    fun getAverageTime(): String {
        val averageTimeMS = totalTimeMS / gamesPlayed
        val hour = (averageTimeMS / (1000 * 60 * 60)) % 24
        val minute = (averageTimeMS / (1000 * 60)) % 60
        val second = (averageTimeMS / 1000) % 60
        if(hour == 0) return String.format("%02dm %02ds", minute, second)
        return String.format("%02dh %02dm %02ds", hour, minute, second)
    }
}
