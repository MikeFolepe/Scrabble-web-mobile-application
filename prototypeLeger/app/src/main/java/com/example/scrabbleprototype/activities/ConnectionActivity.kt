package com.example.scrabbleprototype.activities

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Bundle
import android.text.SpannableString
import android.text.style.UnderlineSpan
import android.util.AttributeSet
import android.util.Base64
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.*
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.PreferenceViewModel
import com.example.scrabbleprototype.viewModel.StatsViewmodel
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
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
import java.util.*
import kotlin.concurrent.timerTask
import kotlin.coroutines.CoroutineContext


class ConnectionActivity : AppCompatActivity(), CoroutineScope {
    val users = Users
    lateinit var client: HttpClient
    lateinit var socket: Socket
    private val mapper = jacksonObjectMapper()
    private lateinit var progressBar: ProgressBar

    private val preferenceViewModel: PreferenceViewModel by viewModels()
    private val statsViewModel: StatsViewmodel by viewModels()
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
        users.currentUser = User("", "", "", "")
        val connectionButton = findViewById<Button>(R.id.connection_button)
        connectionButton.setOnClickListener {
            launch {
                onConnection()
            }
        }

        val retrievePassword = findViewById<TextView>(R.id.password_forgot)
        retrievePassword.setOnClickListener {
            forgotPassword()
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

    private fun forgotPassword() {
        var passwordDialog = Dialog(this)
        passwordDialog.setContentView(R.layout.forgot_password)
        passwordDialog.show()
        val closeDialog = passwordDialog.findViewById<ImageView>(R.id.close)
        closeDialog.setOnClickListener {
            passwordDialog.hide()
        }
        val validateButton = passwordDialog.findViewById<Button>(R.id.validate_button)

        validateButton.setOnClickListener {
            var pseudonymInput = passwordDialog.findViewById<EditText>(R.id.pseudonym)
            var checkPseudonym = pseudonymInput.text.toString()
            launch {
                val response = getEmail(checkPseudonym)
                if(response != null) {
                    val emailfound: String = response.body()
                    if(emailfound != "false") {
                        sendEmailToUser(checkPseudonym)
                    }
                    else {

                        Toast.makeText(this@ConnectionActivity, "Ce pseudonyme n'existe pas.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private suspend fun sendEmailToUser( pseudonym: String): HttpResponse? {
        var response: HttpResponse?
        try {
            response = client.get("$serverUrl/api/user/sendEmailToUser/" + pseudonym){
                contentType(ContentType.Application.Json)
            }
        }  catch(e: Exception) {
            response = null
        }
        return response
    }

    private suspend fun getEmail(pseudonym: String): HttpResponse? {
        var response: HttpResponse?
        try {
            response = client.get("$serverUrl/api/user/getEmail/" + pseudonym){
                contentType(ContentType.Application.Json)
            }
        }  catch(e: Exception) {
            response = null
        }
        return response
    }
    suspend fun onConnection() {
        val pseudonymInput = findViewById<EditText>(R.id.username);
        val pseudonym = pseudonymInput.text.toString()
        val passwordInput = findViewById<EditText>(R.id.password)
        val password = passwordInput.text.toString()

        if(pseudonym.isEmpty())  {
            pseudonymInput.error = "Le pseudonyme ne peut pas être vide"
            return
        }
        if(passwordInput.text.isEmpty()) {
            passwordInput.error = "Le mot de passe ne peut pas être vide"
            return
        }
        val user = User("", pseudonym, password, "")
        Log.d("serverurl", serverUrl)
        val response = findUserInDb(pseudonym, password)
        if(response != null) {
            Log.d("connect", "?")
            val decision: String = response.body()
            if (decision == "true") {
                val response = postAuthentication(user)
                if(response != null) {
                    if (response.status == HttpStatusCode.OK) {
                        var newUser: User =  response.body()
                        val split = newUser.avatar.split(",")
                        val imageBytes = Base64.decode(split[1], Base64.NO_WRAP)
                        val image = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                        users.currentUser = newUser
                        users.avatarBmp = image
                        join()
                    }
                    else if (response.status == HttpStatusCode.NotModified) pseudonymInput.error = "Cet utilisateur est déjà connecté"
                }
            } else {
                Toast.makeText(this@ConnectionActivity, "Aucun compte touvé. Veuillez créer un compte.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    suspend fun findUserInDb(pseudonym: String, password: String): HttpResponse? {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/user/findUserInDb/"+pseudonym+"/"+password) {
                contentType(ContentType.Application.Json)
            }
        } catch(e: Exception) {
            response = null
        }
        Log.d("userindb", response.toString())
        return response
    }

    suspend fun postAuthentication(user: User): HttpResponse? {
        var response: HttpResponse?
        try{
            response = client.post("$serverUrl/api/auth/connect") {
                contentType(ContentType.Application.Json)
                setBody(user)
            }
        } catch(e: Exception) {
            response = null
        }
        return response
    }

    fun join() {
        val intent = Intent(this, MainMenuActivity::class.java)
        progressBar = findViewById(R.id.connection_progress)
        progressBar.visibility = View.VISIBLE
        val progressText = findViewById<TextView>(R.id.requests_load)
        progressText.visibility = View.VISIBLE

        SocketHandler.setPlayerSocket(serverUrl)
        SocketHandler.establishConnection()
        socket = SocketHandler.getPlayerSocket()

        socket.emit("joinRoom")
        socket.on("socketId") { response ->
            users.currentUser.socketId = response[0].toString()
            socket.emit("updateUserSocket", JSONObject(Json.encodeToString(users.currentUser)))
        }
        statsViewModel.addLogin()
        preferenceViewModel.getPreferences()
        //LOAD while we do requests
        Timer().schedule(timerTask {
            runOnUiThread {
                progressBar.visibility = View.GONE
                progressText.visibility = View.GONE
            }
            startActivity(intent)
        }, 750)
    }

    fun createAccount() {
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
