package com.example.scrabbleprototype.model

import com.example.scrabbleprototype.objects.Users

class Game(var startDate: String, var startTime: String, var winnerName: String) {

    fun isWinner(): Boolean {
        return Users.currentUser.pseudonym == winnerName
    }
}
