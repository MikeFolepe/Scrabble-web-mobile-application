package com.example.scrabbleprototype.objects

import com.example.scrabbleprototype.model.User

object Users {
    var activeUsers = mutableListOf<String>()
    lateinit var currentUser: User
}
