package com.example.scrabbleprototype.activities

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.text.SpannableString
import android.text.style.UnderlineSpan
import android.util.Base64
import android.util.Log
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
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
    private var serverUrl = Environment.serverUrl
    val users = Users
    lateinit var client: HttpClient
    lateinit var socket: Socket
    private val mapper = jacksonObjectMapper()

    private val preferenceViewModel: PreferenceViewModel by viewModels()
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
        users.currentUser = User("", "", "", "", false, null)
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
<<<<<<< HEAD
            response = client.get(resources.getString(R.string.http)+users.currentUser.ipAddress+ "/api/user/getEmail/" + pseudonym){
=======
            response = client.get("$serverUrl/api/user/getEmail/" + pseudonym){
>>>>>>> develop
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


        //TO DO mettre une erreur pour si le serveur est down
        //validate username and ip
            val user = User("", pseudonym, password, "", false, null)
            val response = findUserInDb(user, pseudonym, password)
            if(response != null) {
                val decision: String = response.body()
                if (decision == "true") {
                    val response = postAuthentication(user)
                    if(response != null) {
                        if (response.status == HttpStatusCode.OK) {
<<<<<<< HEAD
                            Log.d("newUser", response.body())
                            var newUser =  mapper.readValue(response.body() as String, User::class.java)
                            val split = newUser.avatar.split(",")
                            Log.d("size", split.size.toString())
                            val imageBytes = Base64.decode(split[1], Base64.NO_WRAP)
                            Log.d("image", imageBytes.toString())
                            val image = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                            Log.d("image", image.toString())
                            users.currentUser = newUser
                            users.avatarBmp = image
                            Log.d("newUser", users.currentUser.toString())
                            joinChat(user)
=======
                            var newUser =  mapper.readValue(response.body() as String, User::class.java)
                            val split = newUser.avatar.split(",")
                            val imageBytes = Base64.decode(split[1], Base64.NO_WRAP)
                            val image = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                            users.currentUser = newUser
                            users.avatarBmp = image
                            joinChat()
>>>>>>> develop
                        }
                        else if (response.status == HttpStatusCode.NotModified) pseudonymInput.error = "Cet utilisateur est déjà connecté"
                    }
                    } else {
<<<<<<< HEAD
                    ///Toast.makeText(this, "Aucun compte touvé. Veuillez créer un compte.", Toast.LENGTH_SHORT).show()
=======
                    Toast.makeText(this@ConnectionActivity, "Aucun compte touvé. Veuillez créer un compte.", Toast.LENGTH_SHORT).show()
>>>>>>> develop
                }
                }

    }



/// penser a retirer user ici car il sert que pour l'adresse ip qui est hardcoder bad practice
    suspend fun findUserInDb(user: User ,pseudonym: String, password: String): HttpResponse? {
        var response: HttpResponse?
        try{
<<<<<<< HEAD
            response = client.get(resources.getString(R.string.http) + user.ipAddress+ "/api/user/findUserInDb/"+pseudonym+"/"+password) {
=======
            response = client.get("$serverUrl/api/user/findUserInDb/"+pseudonym+"/"+password) {
>>>>>>> develop
                contentType(ContentType.Application.Json)
            }
        } catch(e: Exception) {
            response = null
        }
        return response
    }

    suspend fun postAuthentication(user: User): HttpResponse? {
        var response: HttpResponse?
        try{
<<<<<<< HEAD
            response = client.post(resources.getString(R.string.http) + user.ipAddress + "/api/auth/connect") {
=======
            response = client.post("$serverUrl/api/auth/connect") {
>>>>>>> develop
                contentType(ContentType.Application.Json)
                setBody(user)
            }
        } catch(e: Exception) {
            response = null
        }
        return response
    }


<<<<<<< HEAD
    fun joinChat(user: User) {
        val intent = Intent(this, MainMenuActivity::class.java)

        SocketHandler.setPlayerSocket("http://" + user.ipAddress)
=======
    fun joinChat() {
        val intent = Intent(this, MainMenuActivity::class.java)

        SocketHandler.setPlayerSocket(serverUrl)
>>>>>>> develop
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
