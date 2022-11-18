package com.example.scrabbleprototype.activities

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.socket.client.Socket
import kotlinx.coroutines.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject
import kotlin.coroutines.CoroutineContext


class ConnectionActivity : AppCompatActivity(), CoroutineScope {
    val users = Users
    val serverUrl = "http://ec2-15-222-249-18.ca-central-1.compute.amazonaws.com:3000"
    lateinit var client: HttpClient
    lateinit var chatSocket: Socket

    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ThemeManager.setActivityTheme(this)
        setContentView(R.layout.activity_connection)

        val connectionButton = findViewById<Button>(R.id.connection_button)
        connectionButton.setOnClickListener {
            onConnection()
        }

        client = HttpClient() {
            install(ContentNegotiation) {
                json()
            }
        }

        findViewById<ConstraintLayout>(R.id.connection_layout).setOnTouchListener { v, event ->
            when (event?.action) {
                MotionEvent.ACTION_DOWN -> {
                    hideKeyboard()
                }
            }
            v?.onTouchEvent(event) ?: true
        }
    }

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        if(this.currentFocus?.windowToken != null) imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }

    fun onConnection() {
        val usernameInput = findViewById<EditText>(R.id.username);
        val username = usernameInput.text.toString()
        //val serverUrl = "http://ec2-15-222-249-18.ca-central-1.compute.amazonaws.com:3000"
        Log.d("urlServer", serverUrl)
        val serverError = "Le serveur est déconnecté"

        if(username.isEmpty())  {
            usernameInput.error = "Le pseudonyme ne peut pas être vide"
            return
        }

        //validate username and ip
        launch {
            val user = User(serverUrl, username, null, false)

            val response = postAuthentication(user)
            if(response != null) {
                if (response.status == HttpStatusCode.OK) {
                    if (response.body()) {
                        users.currentUser = user
                        joinChat(serverUrl, user)
                    } else {
                        usernameInput.error = "Cet utilisateur est déjà connecté"
                    }
                } else if (response.status == HttpStatusCode.NotFound) usernameInput.error = serverError
                else usernameInput.error = serverError
            } else usernameInput.error = serverError
        }
    }

    suspend fun postAuthentication(user: User): HttpResponse? {
        var response: HttpResponse?
        try{
            response = client.post(user.ipAddress + "/api/auth/connect") {
                contentType(ContentType.Application.Json)
                setBody(user)
            }
        } catch(e: Exception) {
            response = null
        }
        return response
    }

    fun joinChat(serverUrl: String, user: User) {
        val intent = Intent(this, MainMenuActivity::class.java)

        SocketHandler.setPlayerSocket(serverUrl)
        SocketHandler.establishConnection()
        chatSocket = SocketHandler.getPlayerSocket()

        chatSocket.emit("joinRoom")
        chatSocket.on("socketId") { response ->
            users.currentUser.socketId = response[0].toString()
            chatSocket.emit("updateUserSocket", JSONObject(Json.encodeToString(users.currentUser)))
        }
        startActivity(intent)
    }
}
