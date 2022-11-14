package com.example.scrabbleprototype.model
import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

enum class State {
    Playing,
    Waiting,
    Finish,
}

@Serializable
class Room(var id: String, var socketIds: ArrayList<String>, var gameSettings: GameSettings, var state: State, var aiPlayersNumber: Int, var humanPlayersNumber: Int, var observers: ArrayList<User>
) {
    @JsonIgnore
    var turnCounter: Int = 0
    @JsonIgnore
    var wordValidation: String = ""
    @JsonIgnore
    var letter: String = ""
    @JsonIgnore
    var aiPlayers: String = ""
    @JsonIgnore
    var placeLetter: String = ""
    @JsonIgnore
    var playerService: String = ""
    @JsonIgnore
    var player: String = ""
    @JsonIgnore
    var skipTurnService: String = ""
    @JsonIgnore
    var ais: String = ""
    @JsonIgnore
    var aiTurn: String = ""
}
