package com.example.scrabbleprototype.model
import kotlinx.serialization.Serializable

enum class State {
    Playing,
    Waiting,
    Finish,
}

@Serializable
class Room(var id: String, var socketIds: ArrayList<String>, var gameSettings: GameSettings, var state: State) {
}
