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
        viewModelScope.launch {
            postGame(game)
        }
    }

    fun saveScore(score: Int) {
        viewModelScope.launch {
            val totalPoints = JSONObject().put("totalPoints", score)
            val response = postScore(totalPoints.toString())
            if(response != null) {
                Users.userStats.totalPoints = score
            }
        }
    }

    private suspend fun postGame(game: Game) = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/userStats/game/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(game)
            }
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Users.userStats.games.add(response.body())
            Users.userStats.gamesPlayed += 1
        }
    }

    private suspend fun postScore(score: String) = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/userStats/totalPoints/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(score)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }
}

