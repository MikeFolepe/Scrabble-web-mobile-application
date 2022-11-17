package com.example.scrabbleprototype.model
import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

enum class State {
    Playing,
    Waiting,
    Finish,
}

@Serializable
class Room(var id: String, var socketIds: ArrayList<String>, var gameSettings: GameSettings, var state: State,
           var aiPlayersNumber: Int, var humanPlayersNumber: Int, var observers: ArrayList<User>
) {}
