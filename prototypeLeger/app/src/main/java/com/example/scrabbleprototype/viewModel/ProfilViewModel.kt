package com.example.scrabbleprototype.viewModel

import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Item
import com.example.scrabbleprototype.model.Player
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import environments.Environment
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.serialization.jackson.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject
import org.json.JSONStringer
import java.lang.Exception

class ProfilViewModel: ViewModel() {


    private var serverUrl = Environment.serverUrl
    private var client: HttpClient = HttpClient() {
        install(ContentNegotiation) {
            jackson()
        }
    }

    fun saveAppTheme() {
        viewModelScope.launch {
            val appThemeName = JSONObject().put("name", Users.userPreferences.appThemeSelected)
            var response = postAppTheme(appThemeName.toString())
            if(response != null) Log.d("postAppTheme", response.body())
        }
    }

    fun saveCurrentBoard() {
        viewModelScope.launch {
            var response = postBoard()
            if(response != null) Log.d("postboard", response.body())
        }
    }

    fun saveCurrentChat() {
        viewModelScope.launch {
            var response = postChat()
            if(response != null) Log.d("postboard", response.body())
        }
    }

    suspend private fun postAppTheme(appThemeName: Any): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/appTheme/" + Users.currentUser.pseudonym) {
                contentType(ContentType.Application.Json)
                setBody(appThemeName)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    suspend private fun postBoard(): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/boardTheme/" + Users.currentUser.pseudonym) {
                contentType(ContentType.Application.Json)
                setBody(Users.userPreferences.boardItemSelected)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    suspend private fun postChat(): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/chatTheme/" + Users.currentUser.pseudonym) {
                contentType(ContentType.Application.Json)
                setBody(Users.userPreferences.chatItemSelected)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }
}

