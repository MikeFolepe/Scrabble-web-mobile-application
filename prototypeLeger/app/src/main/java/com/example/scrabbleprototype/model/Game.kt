package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class Game(var startDate: String, var startTime: String, var winnerName: String) {
}
