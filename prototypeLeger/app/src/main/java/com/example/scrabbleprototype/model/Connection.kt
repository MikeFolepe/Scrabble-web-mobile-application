package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class Connection(var date: String, var time: String, var isLogin: Boolean) {
}
