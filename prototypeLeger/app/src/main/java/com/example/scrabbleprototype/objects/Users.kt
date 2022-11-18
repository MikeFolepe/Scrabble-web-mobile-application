package com.example.scrabbleprototype.objects

import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.model.UserPreferences
import com.example.scrabbleprototype.model.UserStats

object Users {
    var activeUsers = mutableListOf<String>()

    lateinit var currentUser: User
    var userPreferences = UserPreferences()
    var userStats = UserStats()
}
