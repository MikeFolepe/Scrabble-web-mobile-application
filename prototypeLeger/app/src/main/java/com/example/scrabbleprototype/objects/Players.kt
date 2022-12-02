package com.example.scrabbleprototype.objects

import android.util.Log
import androidx.databinding.BaseObservable
import androidx.databinding.Bindable
import androidx.databinding.library.baseAdapters.BR
import com.example.scrabbleprototype.model.Player


object Players: BaseObservable() {

    var currentPlayer: Player = Player()
    var opponents  = arrayListOf<Player>()

    var players = arrayListOf<Player>()

    fun getActivePlayer(): Player {
        Log.d("activeplayer", players.find { it.getTurn() }!!.name)
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
