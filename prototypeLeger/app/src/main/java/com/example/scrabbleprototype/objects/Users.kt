package com.example.scrabbleprototype.objects

import com.example.scrabbleprototype.model.*

object Users {
    var activeUsers = mutableListOf<String>()

    lateinit var currentUser: User
    var userPreferences = UserPreferences()
    var userStats = UserStats()
    var notifications = arrayListOf<Notification>()

    var isObserver: Boolean = false
}
