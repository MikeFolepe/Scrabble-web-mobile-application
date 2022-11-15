package com.example.scrabbleprototype.model

import com.example.scrabbleprototype.R

enum class Language {
    French,
    English,;

    override fun toString(): String {
        if(super.ordinal == 0) return "Français"
        return super.toString()
    }
}

class UserPreferences {
    var appThemeSelected: String = "default"

    val boardItems = arrayListOf(Item("Default Board Theme", 0, R.color.light_green, "Description du thème par défaut : vert clair et turquoise"))
    var boardItemSelected: Item = boardItems.first()

    val chatItems = arrayListOf(Item("Default Chat Theme", 0, R.color.light_green))
    var chatItemSelected: Item = chatItems.first()

    var language: Language = Language.French
}