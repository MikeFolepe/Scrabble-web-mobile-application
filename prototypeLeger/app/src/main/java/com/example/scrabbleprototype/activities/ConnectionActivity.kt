package com.example.scrabbleprototype.activities

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.text.SpannableString
import android.text.style.UnderlineSpan
import android.util.Log
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.viewModels
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.fragment.app.activityViewModels
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.PreferenceViewModel
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import environments.Environment
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
import org.json.JSONObject
import java.lang.Exception
import java.util.*
import kotlin.concurrent.timerTask
import kotlin.coroutines.CoroutineContext


class ConnectionActivity : AppCompatActivity(), CoroutineScope {
    val users = Users
    lateinit var client: HttpClient
    lateinit var socket: Socket

    private val preferenceViewModel: PreferenceViewModel by viewModels()
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + job

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
        createAccount()
    }

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        if(this.currentFocus?.windowToken != null) imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }

    fun onConnection() {
        val usernameInput = findViewById<EditText>(R.id.username);
        val username = usernameInput.text.toString()
        val serverIpInput = findViewById<EditText>(R.id.server_ip)
        val serverIp = resources.getString(R.string.http) + serverIpInput.text.toString()
        Log.d("ipserver", serverIp)
        val serverError = "Ce serveur est déconnecté"

        if(username.isEmpty())  {
            usernameInput.error = "Le pseudonyme ne peut pas être vide"
            return
        }
        if(serverIpInput.text.isEmpty()) {
            serverIpInput.error = "Le IP du serveur ne peut pas être vide"
            return
        }

        //validate username and ip
       launch {
            val user = User("", username, "", "", false, serverIp)

            val response = postAuthentication(user)
            if(response != null) {
                if (response.status == HttpStatusCode.OK) {
                    val userReceived: User = response.body()
                    users.currentUser = userReceived
                    join(serverIp)

                } else if (response.status == HttpStatusCode.NotModified) usernameInput.error = "Cet utilisateur est déjà connecté"
                else if (response.status == HttpStatusCode.NotFound) serverIpInput.error = serverError
                else serverIpInput.error = serverError
            } else serverIpInput.error = serverError
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

    fun join(serverIp: String) {
        val intent = Intent(this, MainMenuActivity::class.java)

        SocketHandler.setPlayerSocket(serverIp)
        SocketHandler.establishConnection()
        socket = SocketHandler.getPlayerSocket()

        socket.emit("joinRoom")
        socket.on("socketId") { response ->
            users.currentUser.socketId = response[0].toString()
            socket.emit("updateUserSocket", JSONObject(Json.encodeToString(users.currentUser)))
        }
        preferenceViewModel.getPreferences()
        //LOAD while we do requests
        Timer().schedule(timerTask {
            startActivity(intent)
        }, 250)
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
