package com.example.scrabbleprototype.model

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

@Serializable
class Item(var name: String, @get:JsonIgnore var price: Int, @get:JsonIgnore var theme: Int,
           @get:JsonIgnore var description: String = "") {

}
