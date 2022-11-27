package com.example.scrabbleprototype.viewModel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.lang.Exception

class PreferenceViewModel: ViewModel() {

    private var serverUrl = Environment.serverUrl
    private var client: HttpClient = HttpClient() {
        install(ContentNegotiation) {
            jackson()
        }
    }

    fun getPreferences() {
        viewModelScope.launch {
            getAppTheme()
            getCurrentBoard()
            getCurrentChat()
            getBoards()
            getChats()
            getLanguage()
        }
    }

    private suspend fun getAppTheme() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/preference/appTheme/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getAppTheme", response.body())
            Users.userPreferences.appThemeSelected = response.body()
            ThemeManager.changeToTheme(Themes.appThemes.indexOf(response.body()))
        }
    }

    private suspend fun getCurrentBoard() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/preference/boardTheme/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getCurrentBoard", response.body())
            val boardReceived = Themes.getBoard(response.body()) ?: return@withContext
            Users.userPreferences.boardItemSelected = boardReceived
            ThemeManager.currentBoardTheme = boardReceived.name
        }
    }

    private suspend fun getCurrentChat() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/preference/chatTheme/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getChatTheme", response.body())
            val chatReceived = Themes.getChat(response.body()) ?: return@withContext
            Users.userPreferences.chatItemSelected = chatReceived
            ThemeManager.currentChatTheme = chatReceived.name
        }
    }

    private suspend fun getBoards() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/preference/boards/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getBoards", response.body())
            Users.userPreferences.boardItems.clear()
            Users.userPreferences.boardItems.add(Themes.defaultItem)
            for(boardName in response.body<Array<String>>()) {
                val boardReceived = Themes.getBoard(boardName)
                if(boardReceived != null) Users.userPreferences.boardItems.add(boardReceived)
            }
        }
    }

    private suspend fun getChats() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/preference/chats/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getChats", response.body())
            Users.userPreferences.chatItems.clear()
            Users.userPreferences.chatItems.add(Themes.defaultItem)
            for(chatName in response.body<Array<String>>()) {
                val chatReceived = Themes.getChat(chatName)
                if(chatReceived != null) Users.userPreferences.chatItems.add(chatReceived)
            }
        }
    }

    private suspend fun getLanguage() = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/preference/language/" + Users.currentUser._id) {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            Log.d("getLanguage", response.body())
            Users.userPreferences.language = Language.values()[response.body<String>().toInt()]
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
            if(response != null) Log.d("postChat", response.body())
        }
    }

    fun saveBoughtBoard(boughtBoard: Item) {
        viewModelScope.launch {
            var response = addBoard(boughtBoard)
            if(response != null) Log.d("addboard", response.body())
        }
    }

    fun saveBoughtChat(boughtChat: Item) {
        viewModelScope.launch {
            var response = addChat(boughtChat)
            if(response != null) Log.d("addChat", response.body())
        }
    }

    fun saveLanguage() {
        viewModelScope.launch {
            val language = JSONObject().put("language", Users.userPreferences.language.ordinal)
            var response = postLanguage(language.toString())
            if(response != null) Log.d("postLanguage", response.body())
        }
    }

    private suspend fun postAppTheme(appThemeName: String): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/appTheme/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(appThemeName)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    private suspend fun postBoard(): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/boardTheme/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(Users.userPreferences.boardItemSelected)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    private suspend fun postChat(): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/chatTheme/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(Users.userPreferences.chatItemSelected)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    private suspend fun addBoard(boughtBoard: Item): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/addBoard/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(boughtBoard)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    private suspend fun addChat(boughtChat: Item): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/addChat/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(boughtChat)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }

    private suspend fun postLanguage(language: String): HttpResponse? = withContext(Dispatchers.Default) {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/user/preference/setLanguage/" + Users.currentUser._id) {
                contentType(ContentType.Application.Json)
                setBody(language)
            }
        } catch(e: Exception) {
            response = null
        }
        return@withContext response
    }
}

