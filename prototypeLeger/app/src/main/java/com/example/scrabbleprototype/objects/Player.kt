package com.example.scrabbleprototype.objects

import androidx.databinding.BaseObservable
import androidx.databinding.Bindable
import androidx.databinding.library.baseAdapters.BR
import com.example.scrabbleprototype.model.Player


object Players: BaseObservable() {

    var currentPlayer: Player = Player()
    var opponents  = arrayListOf<Player>()
}
