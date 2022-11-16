package com.example.scrabbleprototype.viewModel

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Player
import com.example.scrabbleprototype.objects.Players

class PlayersViewModel: ViewModel() {
    var playersInGame = arrayListOf<Player>()
    var playerUpdatedPosition: MutableLiveData<Int> = MutableLiveData(0)

    fun initializePlayersOrder() {
        playersInGame = Players.players
    }

    fun notifyItemChangedAt(position: Int) {
        playerUpdatedPosition.value = position
    }
}
