package com.example.scrabbleprototype.model

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import com.fasterxml.jackson.annotation.JsonIgnore
import environments.Environment.serverUrl
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

@Serializable
class User(var avatar: String, var pseudonym: String,var password: String, var email: String) {
    var xpPoints: Int = 99999
    @JsonIgnore
    val friends = arrayListOf<Friend>()

    var _id: String = ""
    var isObserver = false
    var socketId =""

    fun getAvatarBitmap(): Bitmap {
        val split = avatar.split(",")
        val imageBytes = Base64.decode(split[1], Base64.NO_WRAP)
        return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
    }
}
