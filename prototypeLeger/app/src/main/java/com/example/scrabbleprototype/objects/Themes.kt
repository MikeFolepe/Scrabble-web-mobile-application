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

        boardItems.add(Item("Gradients animés", 300, R.drawable.gradient_animation))
        boardItems.add(Item("Tartan", 100, R.drawable.tartan))
        boardItems.add(Item("Galaxie", 500, R.drawable.galaxy))

        chatItems.add(Item("Gradients animés", 100, R.drawable.gradient_animation))
        chatItems.add(Item("Galaxie", 100, R.drawable.galaxy))
    }
}
