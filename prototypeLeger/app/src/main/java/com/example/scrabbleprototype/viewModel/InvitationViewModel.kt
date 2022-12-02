package com.example.scrabbleprototype.viewModel

import android.util.Log
import androidx.lifecycle.MutableLiveData
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

    var isProfilInit = MutableLiveData(false)
    var areNotifsInit = MutableLiveData(false)

    private var serverUrl = Environment.serverUrl
    private var client: HttpClient = HttpClient() {
        install(ContentNegotiation) {
            json(Json{ ignoreUnknownKeys = true })
        }
    }

    fun getFriendsAndInvites() {
        isProfilInit.value = false
        viewModelScope.launch {
            getFriends()
            getInvitations()
        }
    }

    fun updateNotifications() {
        areNotifsInit.value = false
        viewModelScope.launch {
            getNotifications()
        }
    }

    private suspend fun getFriends() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/friends/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getFriends", response.body())
            Users.currentUser.friends = response.body()
        }
    }

    private suspend fun getInvitations() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/invitations/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getInvites", response.body())
            Users.currentUser.invitations = response.body()
            isProfilInit.postValue(true)
        }
    }

    private suspend fun getNotifications() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/notifications/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getNotifs", response.body())
            Users.currentUser.notifications = response.body()
            areNotifsInit.postValue(true)
        }
    }
}

