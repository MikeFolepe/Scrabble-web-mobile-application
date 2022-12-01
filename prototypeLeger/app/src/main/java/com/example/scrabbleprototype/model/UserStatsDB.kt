package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class UserStatsDB {
    var userId: String = ""
    var gamesPlayed: Int = 0
    var gamesWon: Int = 0
    var totalPoints: Int = 0
    var totalTimeMs: Int = 0
    var logins = arrayListOf<Connection>()
    var logouts = arrayListOf<Connection>()
    var games = arrayListOf<Game>()
}
