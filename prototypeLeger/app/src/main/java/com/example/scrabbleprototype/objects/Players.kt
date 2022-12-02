package com.example.scrabbleprototype.objects

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import androidx.databinding.BaseObservable
import androidx.databinding.Bindable
import androidx.databinding.library.baseAdapters.BR
import com.example.scrabbleprototype.model.Player


object Players: BaseObservable() {

    var currentPlayer: Player = Player()
    var currentPlayerPosition: Int = 0
    var opponents  = arrayListOf<Player>()

    var players = arrayListOf<Player>()

    fun getActivePlayer(): Player {
        return players.find { it.getTurn() }!!
    }
    @Bindable
    fun getCurrent(): Player {
        return currentPlayer
    }

    @Bindable
    fun setCurrent(player: Player) {
        currentPlayer = player
        notifyPropertyChanged(BR.current)
    }
}
