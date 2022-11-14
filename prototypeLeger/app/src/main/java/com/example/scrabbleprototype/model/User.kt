package com.example.scrabbleprototype.model

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

@Serializable
class User(var ipAddress: String, var pseudonym: String, var socketId: String?, var isObserver: Boolean) {
    @JsonIgnore
    var xpPoints: Int = 0
    @JsonIgnore
    var email: String = "test@gmail.com"
    @JsonIgnore
    var avatar: String = ""
}
