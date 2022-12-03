package com.example.scrabbleprototype.objects

import android.util.Log
import com.example.scrabbleprototype.model.Language

object MyLanguage {
    var currentLanguage = Language.French

    fun getLanguage(): String {
        return if(currentLanguage == Language.French) {
            Log.d("swapTO", "french")
            "fr"
        }
        else "en"
    }
}
