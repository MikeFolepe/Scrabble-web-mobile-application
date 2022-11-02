package com.example.scrabbleprototype.objects

import com.example.scrabbleprototype.model.Player


object Players {

    var currentPlayer: Player = Player()
    var opponents  = arrayListOf<Player>()
}
