package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class User(var ipAddress: String, var pseudonym: String, var socketId: String?) {}
