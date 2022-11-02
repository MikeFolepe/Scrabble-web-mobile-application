package com.example.scrabbleprototype.viewModel

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.scrabbleprototype.model.Orientation
import com.example.scrabbleprototype.model.Vec2

class PlacementViewModel: ViewModel() {
    var word: String = ""
    var startPosition: Vec2 = Vec2(0,0)
    var orientation: Orientation = Orientation.Horizontal
    val currentPlacement = mutableMapOf<Int, String>()
    var currentPlacementLength: MutableLiveData<Int> = MutableLiveData(0)

    fun addLetter(position: Int, letter: String) {
        currentPlacement[position] = letter
        currentPlacementLength.value = currentPlacement.size
    }
    fun removeLetter(position: Int) {
        currentPlacement.remove(position)
        currentPlacementLength.value = currentPlacement.size
    }
    fun clearPlacement() {
        currentPlacement.clear()
        currentPlacementLength.value = 0
    }
}
