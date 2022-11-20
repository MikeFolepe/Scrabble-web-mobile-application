package com.example.scrabbleprototype.model

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

@Serializable
class User(var avatar: String, var pseudonym: String,var password: String, var email: String, var isObserver: Boolean = false, var socketId: String?) {
    @JsonIgnore
    var xpPoints: Int = 0
    @JsonIgnore
    var ipAddress: String = "192.168.0.31:3000"

}
