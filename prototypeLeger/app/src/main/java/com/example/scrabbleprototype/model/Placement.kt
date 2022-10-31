package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
enum class Orientation {
    Horizontal,
    Vertical,
}

@Serializable
data class Vec2(var x: Int, var y: Int) {}
