package com.example.scrabbleprototype.model

import androidx.databinding.BaseObservable
import androidx.databinding.Bindable
import androidx.databinding.library.baseAdapters.BR
import com.example.scrabbleprototype.objects.LetterRack
import kotlinx.serialization.Serializable

@Serializable
class Player: BaseObservable() {
    var id: Int = 0
    var name: String = ""
    var letterTable = arrayListOf<Letter>()
    var score: Int = 0
    private var isTurn = false

    @Bindable
    fun getTurn(): Boolean { return isTurn
    }

    @Bindable
    fun setTurn(turn: Boolean) {
        isTurn = turn
        notifyPropertyChanged(BR.turn)
    }
}
