package com.example.scrabbleprototype.model

import com.fasterxml.jackson.annotation.JsonIgnore
import environments.Environment
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@Serializable
class User(var avatar: String, var pseudonym: String,var password: String, var email: String, var isObserver: Boolean = false, var socketId: String?) {
    @JsonIgnore
    var xpPoints: Int = 99999
    @JsonIgnore
    val friends = arrayListOf<Friend>()
    @JsonIgnore
    var ipAddress: String = Environment.serverUrl
    //var ipAddress: String = "10.200.37.104:3000"
    var invitations = arrayListOf<Friend>()
    var notifications = arrayListOf<Notification>()

    var _id: String = ""
}
