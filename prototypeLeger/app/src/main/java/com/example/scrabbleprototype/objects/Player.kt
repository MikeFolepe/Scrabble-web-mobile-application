package com.example.scrabbleprototype.objects

import androidx.databinding.BaseObservable
import androidx.databinding.Bindable
import androidx.databinding.library.baseAdapters.BR


object Player: BaseObservable() {
    private var isTurn = false

    @Bindable
    fun getTurn(): Boolean { return isTurn }

    @Bindable
    fun setTurn(turn: Boolean) {
        isTurn = turn
        notifyPropertyChanged(BR.turn)
    }
}
