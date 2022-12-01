package com.example.scrabbleprototype.model

import android.graphics.Bitmap
import com.fasterxml.jackson.annotation.JsonIgnore
import environments.Environment
import kotlinx.serialization.Serializable

@Serializable
class User(var avatar: String, var pseudonym: String,var password: String, var email: String) {
    var xpPoints: Int = 99999
    val friends = arrayListOf<Friend>()
    //var ipAddress: String = "10.200.37.104:3000"
    var _id: String = ""
    var isObserver = false
    var socketId =""
}
