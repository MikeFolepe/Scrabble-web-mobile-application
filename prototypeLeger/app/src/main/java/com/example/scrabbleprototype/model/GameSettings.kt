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
class GameSettings(var creatorName: String, var startingPlayer: StartingPlayer, var timeMinute: String,
                   var timeSecond: String, var level: AiType, var dictionary: String) {}
