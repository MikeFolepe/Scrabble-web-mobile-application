package com.example.scrabbleprototype.objects

import com.example.scrabbleprototype.model.Player


object Players {

    var currentPlayer: Player = Player()
    var currentPlayerPosition: Int = 0
    var opponents  = arrayListOf<Player>()
}
