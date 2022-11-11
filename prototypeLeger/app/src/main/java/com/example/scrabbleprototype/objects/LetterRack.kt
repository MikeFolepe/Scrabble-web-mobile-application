package com.example.scrabbleprototype.objects

import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Letter

object LetterRack {
    var letters = ArrayList<Letter>(7)

    fun removeLetter(position: Int) {
        letters[position] = Constants.EMPTY_LETTER
        for(i in position until letters.size - 1) {
            letters[position] = letters[position + 1]
        }
    }
}
