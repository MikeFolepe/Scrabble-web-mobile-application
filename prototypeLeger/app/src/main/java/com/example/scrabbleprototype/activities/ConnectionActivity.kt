package com.example.scrabbleprototype.activities

import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import androidx.annotation.DrawableRes
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.model.Users
import com.google.android.material.snackbar.BaseTransientBottomBar
import com.google.android.material.snackbar.Snackbar
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.socket.client.Socket
import kotlinx.coroutines.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.lang.Exception
import kotlin.coroutines.CoroutineContext


class ConnectionActivity : AppCompatActivity(), CoroutineScope {
    val users = Users
    lateinit var client: HttpClient
    lateinit var chatSocket: Socket

    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_connection)

        val connectionButton = findViewById<Button>(R.id.connection_button)
        connectionButton.setOnClickListener {
            onConnection()
        }
        val serverIpText = findViewById<EditText>(R.id.server_ip)
        serverIpText.setText(resources.getString(R.string.mobile_server_ip))

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
        val username = findViewById<EditText>(R.id.username).text.toString()
        val serverIp = findViewById<EditText>(R.id.server_ip).text.toString()

        //validate username and ip
        launch {
            val serverStatusNotif = Snackbar.make(findViewById(android.R.id.content), "Ce serveur est déconnecté", BaseTransientBottomBar.LENGTH_LONG)
            val user = User(serverIp, username, null)

            val response = postAuthentication(user)
            if(response != null) {
                if (response.status == HttpStatusCode.OK) {
                    if (response.body()) {
                        users.currentUser = username
                        joinChat(serverIp, user)
                    } else {
                        val userAlreadyConnectedNotif = Snackbar.make(
                            findViewById(android.R.id.content),
                            "Cet utlisateur est déjà connecté",
                            BaseTransientBottomBar.LENGTH_LONG
                        )
                        userAlreadyConnectedNotif.show()
                    }
                } else if (response.status == HttpStatusCode.NotFound) serverStatusNotif.show()
                else serverStatusNotif.show()
            } else serverStatusNotif.show()
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

    fun joinChat(serverIp: String, user: User) {
        val intent = Intent(this, ChatActivity::class.java)

        SocketHandler.setSocket(serverIp)
        SocketHandler.establishConnection()
        chatSocket = SocketHandler.getSocket()

        chatSocket.emit("joinRoom")
        chatSocket.on("socketId") { response ->
            user.socketId = response[0].toString()
            chatSocket.emit("updateUserSocket", Json.encodeToString(user))
        }
        startActivity(intent)
    }
}
