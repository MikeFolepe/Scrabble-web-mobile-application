package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class Friend(var pseudonym: String, var avatar: String, var xpPoints: Int) {

}
