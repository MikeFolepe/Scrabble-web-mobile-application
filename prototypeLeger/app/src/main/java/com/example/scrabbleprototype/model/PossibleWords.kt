package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class PossibleWords {
    var word: String = ""
    var orientation: Orientation = Orientation.Horizontal
    var line: Int = 0
    var startIndex: Int = 0
    var point: Int = 0
}
