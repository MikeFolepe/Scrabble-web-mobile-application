package com.example.scrabbleprototype.model

object Users {
    var activeUsers = mutableListOf<String>()
    var currentUser: String = ""
    var ipAddress: String = ""
    var isObserver: Boolean = false
}
