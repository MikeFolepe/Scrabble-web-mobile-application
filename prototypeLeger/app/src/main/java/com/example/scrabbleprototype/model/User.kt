package com.example.scrabbleprototype.model

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

@Serializable
class User(var ipAddress: String, var pseudonym: String, var socketId: String?) {
    @JsonIgnore
    var xpPoints: Int = 0
}
