package com.example.scrabbleprototype.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.objects.Users
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.*
import java.lang.Exception
import java.util.regex.Pattern
import kotlin.coroutines.CoroutineContext

class RegisterActivity : AppCompatActivity(), CoroutineScope {
    val users = Users
    val avatarSrcImages= arrayListOf("@drawable/orange_guy", "drawable/blonde_girl", "@drawable/blonde_guy", "@drawable/brunette_girl", "@drawable/doggo", "@drawable/earrings_girl", "@drawable/ginger_girl", "@drawable/hat_girl", "@drawable/music_guy", "@drawable/mustache_guy", "@drawable/orange_guy")
    lateinit var client: HttpClient
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        client = HttpClient() {
            install(ContentNegotiation) {
                json()
            }
        }
        val createButton = findViewById<Button>(R.id.connection_button)
        createButton.setOnClickListener {
            launch {
                onRegister()
            }
        }
    }

    private suspend fun onRegister() {
        val emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+"
        val pseudoInput = findViewById<EditText>(R.id.pseudonym)
        val pseudonym = pseudoInput.text.toString()
        val emailInput = findViewById<EditText>(R.id.courriel)
        val email = emailInput.text.toString()
        val passwordInput = findViewById<EditText>(R.id.password)
        val password = passwordInput.text.toString()
        val confirmPasswordInput = findViewById<EditText>(R.id.reconfirm)
        val confirmPassword = confirmPasswordInput.text.toString()

        if(pseudonym.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty())  {
            Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_LONG).show()
            return
        }
        else if(!email.matches(emailPattern.toRegex())) {
            Toast.makeText(this, "Veuillez entrer une adresse email valide", Toast.LENGTH_LONG).show()
            return
        }
        else if(password != confirmPassword) {
            Toast.makeText(this, "Les deux mots de passe ne correspondent pas", Toast.LENGTH_LONG).show()
            return
        }

        val user = User("", pseudonym, password, email, false, null)

        val response = async {checkPseudonym(user)}
        val pseudoChecked = response.await()
        if (pseudoChecked != null) {
            val checked: String = pseudoChecked.body()
            if(checked == "true"){
                Toast.makeText(this, "Ce pseudonyme existe déjà", Toast.LENGTH_LONG).show()
                return;
            }
        }
        Log.d("avant", "registration")
        val registerResponse = postRegistration(user)
        if(registerResponse != null) {
            if(registerResponse.status == HttpStatusCode.OK) {
                Toast.makeText(
                    this,
                    "Votre compte a bien été créé, veuillez vous connecter.",
                    Toast.LENGTH_LONG
                ).show()
                startActivity(Intent(this, ConnectionActivity::class.java))
            }
        }

    }

    suspend fun checkPseudonym(user: User): HttpResponse? {
        var response: HttpResponse?
        try {
            response = client.get(resources.getString(R.string.http) + user.ipAddress+ "/api/user/checkPseudonym/"+user.pseudonym){
                contentType(ContentType.Application.Json)
            }
        }  catch(e: Exception) {
        response = null
    }
        return response
    }

    suspend fun postRegistration(user: User): HttpResponse? {
        var response: HttpResponse?
        try{
            response = client.post(resources.getString(R.string.http) + user.ipAddress + "/api/user/users") {
                contentType(ContentType.Application.Json)
                setBody(user)
            }
        } catch(e: Exception) {
            response = null
        }
        return response
    }
}
