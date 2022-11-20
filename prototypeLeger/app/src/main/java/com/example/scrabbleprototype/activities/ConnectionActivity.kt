KSpackage com.example.scrabbleprototype.activities

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
import android.widget.Toast
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
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
        val username = usernameInput.text.toString()
        val passwordInput = findViewById<EditText>(R.id.password)
        val password = resources.getString(R.string.http) + passwordInput.text.toString()
        val serverError = "Ce serveur est déconnecté"

        if(username.isEmpty())  {
            usernameInput.error = "Le pseudonyme ne peut pas être vide"
            return
        }
        if(passwordInput.text.isEmpty()) {
            passwordInput.error = "Le mot de passe ne peut pas être vide"
            return
        }

        //validate username and ip
        launch {
            val user = User("", username, password, "", false, null)
            val response = findUserInDb(user, username, password)
            if(response != null) {
                if (response.body()) {
                    val response = async {postAuthentication(user)}
                    val newUser = response.await()
                    Log.d("newUser" , newUser.toString())


                        users.currentUser = user
                        joinChat(user)
                    } else {
                }
                }
        }
    }
/// penser a retirer user ici car il sert que pour l'adresse ip qui est hardcoder bad practice
    suspend fun findUserInDb(user: User ,pseudonym: String, password: String): HttpResponse? {
        var response: HttpResponse?
        try{
            response = client.get(resources.getString(R.string.http) + user.ipAddress+ "/api/user/findUserInDb/"+pseudonym+"/"+password) {
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
            response = client.post(resources.getString(R.string.http) + user.ipAddress + "/api/auth/connect") {
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
=======
    fun join(serverIp: String) {
>>>>>>> develop
        val intent = Intent(this, MainMenuActivity::class.java)

        SocketHandler.setPlayerSocket(user.ipAddress)
        SocketHandler.establishConnection()
        chatSocket = SocketHandler.getPlayerSocket()

        chatSocket.emit("joinRoom")
        chatSocket.on("socketId") { response ->
            users.currentUser.socketId = response[0].toString()
            chatSocket.emit("updateUserSocket", JSONObject(Json.encodeToString(users.currentUser)))
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
