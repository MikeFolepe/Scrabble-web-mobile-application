package com.example.scrabbleprototype.activities

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.SpannableString
import android.text.style.UnderlineSpan
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import environments.Environment.serverUrl
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
    lateinit var client: HttpClient
    lateinit var socket: Socket

    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)
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
        createAccount()
    }

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        if(this.currentFocus?.windowToken != null) imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }

    fun onConnection() {
        val usernameInput = findViewById<EditText>(R.id.username);
        val signInPasswordInput = findViewById<EditText>(R.id.signIn_password)
        val username = usernameInput.text.toString()
        val serverError = "Le serveur est déconnecté"

        if(username.isEmpty())  {
            usernameInput.error = "Le pseudonyme ne peut pas être vide"
            return
        }

        //validate username and ip
       launch {
            val user = User("", username, "", "", false, serverUrl)

            val response = postAuthentication(user)
            if(response != null) {
                if (response.status == HttpStatusCode.OK) {
                    val userReceived: User = response.body()
                    users.currentUser = userReceived
                    join(serverUrl)

                } else if (response.status == HttpStatusCode.NotModified) usernameInput.error = "Cet utilisateur est déjà connecté"
                else if (response.status == HttpStatusCode.NotFound) signInPasswordInput.error = serverError
                else signInPasswordInput.error = serverError
            } else signInPasswordInput.error = "réponse nulle du serveur"
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

    fun join(serverUrl: String) {
        val intent = Intent(this, MainMenuActivity::class.java)

        SocketHandler.setPlayerSocket(serverUrl)
        SocketHandler.establishConnection()
        socket = SocketHandler.getPlayerSocket()

        socket.emit("joinRoom")
        socket.on("socketId") { response ->
            users.currentUser.socketId = response[0].toString()
            socket.emit("updateUserSocket", JSONObject(Json.encodeToString(users.currentUser)))
        }
        startActivity(intent)
    }

    fun createAccount(){
        val textAccount = findViewById<TextView>(R.id.create_account)
        val mString = "Pas de compte? Créez-en un."
        val mSpannableString = SpannableString(mString)
        mSpannableString.setSpan(UnderlineSpan(), 0, mSpannableString.length, 0)
        textAccount.text = mSpannableString
        textAccount.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}
