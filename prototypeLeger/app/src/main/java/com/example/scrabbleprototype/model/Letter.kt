package com.example.scrabbleprototype.model

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

@Serializable
class Letter(var value : String, var quantity : Int, var points : Int, var isSelectedForSwap : Boolean, var isSelectedForManipulation : Boolean) {

    @JsonIgnore
    var isValidated: Boolean = false

    fun isEmpty(): Boolean {
        if(this.value == "") return true
        return false
    }
}

