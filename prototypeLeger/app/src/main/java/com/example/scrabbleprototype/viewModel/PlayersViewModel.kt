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
        var numberOfOpponentsAdded = 0
        for(i in 0 until Constants.MAX_PLAYERS) {
            if(i == Players.currentPlayerPosition) playersInGame.add(Players.currentPlayer)
            else playersInGame.add(Players.opponents[numberOfOpponentsAdded++])
        }
    }

    fun notifyItemChangedAt(position: Int) {
        playerUpdatedPosition.value = position
    }
}
