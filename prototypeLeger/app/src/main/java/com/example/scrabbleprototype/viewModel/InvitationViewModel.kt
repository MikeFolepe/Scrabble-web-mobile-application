package com.example.scrabbleprototype.viewModel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.scrabbleprototype.model.*
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
import io.ktor.http.ContentType.Application.Json
import io.ktor.serialization.jackson.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.lang.Exception

class InvitationViewModel: ViewModel() {

    private var serverUrl = Environment.serverUrl
    private var client: HttpClient = HttpClient() {
        install(ContentNegotiation) {
            json(Json{ ignoreUnknownKeys = true })
        }
    }

    fun addInvitation(invitation: Friend) {
        viewModelScope.launch {
            val response = postInvitation(invitation)
            if(response != null) Log.d("addInvitation", response.body())
        }
    }

    private suspend fun postInvitation(invitation: Friend) = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/addInvitation/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(invitation)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }
}

