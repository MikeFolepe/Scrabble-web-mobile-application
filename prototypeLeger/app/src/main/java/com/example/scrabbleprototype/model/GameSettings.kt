package com.example.scrabbleprototype.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class StartingPlayer {
    Player1,
    Player2,
}

@Serializable
enum class AiType {
    beginner,
    expert,
}

@Serializable
enum class RoomType {
    public,
    private,
}

@Serializable
enum class NumberOfPlayer {
    OneVone,
    OneVthree
}

@Serializable
class GameSettings(var creatorName: String, var startingPlayer: StartingPlayer, var timeMinute: String,
                   var timeSecond: String, var level: AiType, var dictionary: String, var type: Int,
                   var gameType: Int) {
    var password: String = ""
}
