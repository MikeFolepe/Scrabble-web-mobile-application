package com.example.scrabbleprototype.viewModel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.scrabbleprototype.model.Game
import com.example.scrabbleprototype.model.Item
import com.example.scrabbleprototype.model.Language
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Themes
import com.example.scrabbleprototype.objects.Users
import environments.Environment
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.jackson.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.lang.Exception

class StatsViewmodel: ViewModel() {

    private var serverUrl = Environment.serverUrl
    private var client: HttpClient = HttpClient() {
        install(ContentNegotiation) {
            json()
        }
    }

    fun saveNewGame(game: Game) {
        Log.d("saveGame", game.startDate + " " + game.startTime + " " + game.winnerName)
        viewModelScope.launch {
            val response = postGame(game)
            if(response != null) Log.d("saveGame", response.body())
        }
    }

    fun saveScore(score: Int) {
        viewModelScope.launch {
            val totalPoints = JSONObject().put("totalPoints", score)
            val response = postScore(totalPoints.toString())
            if(response != null) {
                Log.d("saveScore", response.body())
            }
        }
    }

    fun updateGamesWon(gamesWon: Int) {
        viewModelScope.launch {
            val gamesWon = JSONObject().put("gamesWon", gamesWon)
            val response = postGamesWon(gamesWon.toString())
            if(response != null) {
                Log.d("updateGamesWon", response.body())
            }
        }
    }

    fun saveXp() {
        viewModelScope.launch {
            val xp = JSONObject().put("xpPoints", Users.currentUser.xpPoints)
            val response = postXp(xp.toString())
            if(response != null) {
                Log.d("saveXp", response.body())
            }
        }
    }

    private suspend fun postGame(game: Game) = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/userStats/game/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(game)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    private suspend fun postScore(score: String) = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/userStats/totalPoints/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(score)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    private suspend fun postGamesWon(gamesWon: String) = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/userStats/gamesWon/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(gamesWon)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    private suspend fun postXp(xp: String) = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/users/xpPoints/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(xp)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }
}

