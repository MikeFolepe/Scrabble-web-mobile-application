package com.example.scrabbleprototype.model

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

@Serializable
enum class Orientation {
    Horizontal,
    Vertical,
}

@Serializable
data class Vec2(var x: Int, var y: Int) {
    @JsonIgnore
    var word: String = ""
}

