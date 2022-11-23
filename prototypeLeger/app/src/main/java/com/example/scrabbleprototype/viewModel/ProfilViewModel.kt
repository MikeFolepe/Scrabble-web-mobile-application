package com.example.scrabbleprototype.viewModel

import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Player
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.Users
import environments.Environment
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.lang.Exception

class ProfilViewModel: ViewModel() {


    private var serverUrl = Environment.serverUrl
    private var client: HttpClient = HttpClient() {
        install(ContentNegotiation) {
            json()
        }
    }

    fun saveCurrentBoard(boardName: String) {
        viewModelScope.launch {
            var response = postBoard(boardName)
            if(response != null) Log.d("postboard", response.body())
        }
    }

    suspend fun postBoard(boardName: String): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post( serverUrl + "/user/preference/boardTheme/" + Users.currentUser.pseudonym) {
                setBody(boardName)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

}

