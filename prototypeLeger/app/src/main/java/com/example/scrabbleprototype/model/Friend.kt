package com.example.scrabbleprototype.model

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import kotlinx.serialization.Serializable

@Serializable
class Friend(var pseudonym: String, var avatar: String, var xpPoints: Int) {
    fun getAvatarBitmap(): Bitmap {
        val split = avatar.split(",")
        val imageBytes = Base64.decode(split[1], Base64.NO_WRAP)
        return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
    }
}
