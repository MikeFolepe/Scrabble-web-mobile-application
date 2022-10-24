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
class GameSettings(var playersNames: ArrayList<String>, var startingPlayer: StartingPlayer,
                   var timeMinute: String, var timeSecond: String, var level: AiType, var randomBonus: String,
                   var bonusPositions: String, var dictionary: String, var objectiveIds: Array<IntArray>) {
}
