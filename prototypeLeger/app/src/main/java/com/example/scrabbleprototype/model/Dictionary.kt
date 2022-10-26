package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
data class Dictionary(var filename: String, var title: String, var description: String, var isDefault: String) {
}
