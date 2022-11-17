package com.example.scrabbleprototype.objects

import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.Item

object Themes {
    var appThemes = arrayListOf<String>()
    val boardItems = arrayListOf<Item>()
    val chatItems = arrayListOf<Item>()

    init {
        appThemes.add("Default")
        appThemes.add("Dark")
        appThemes.add("Blue")
        appThemes.add("Orange")

        boardItems.add(Item("1st Board Theme", 100, R.color.light_cyan))
        boardItems.add(Item("2nd Board Theme", 100, R.color.light_red))
        boardItems.add(Item("3rd Board Theme", 100, R.color.gold))

        chatItems.add(Item("1st Chat Theme", 100, R.color.light_cyan))
        chatItems.add(Item("2nd Chat Theme", 100, R.color.light_red))
    }
}
