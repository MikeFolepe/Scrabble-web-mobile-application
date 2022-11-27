package com.example.scrabbleprototype.activities

import android.Manifest
import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.text.SpannableString
import android.text.style.UnderlineSpan
import android.util.Log
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.toBitmap
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.AvatarAdapter
import com.example.scrabbleprototype.model.User
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.socket.engineio.parser.Base64
import kotlinx.coroutines.*
import java.io.ByteArrayOutputStream
import kotlin.coroutines.CoroutineContext


class RegisterActivity : AppCompatActivity(), CoroutineScope {

    var user = User("", "", "", "", false, null)
    lateinit var myavatar : ImageView
    lateinit var avatarButton : Button
    val avatarSrcImages = arrayListOf(R.drawable.blonde_girl, R.drawable.blonde_guy, R.drawable.brunette_girl, R.drawable.doggo, R.drawable.earrings_girl, R.drawable.ginger_girl, R.drawable.hat_girl, R.drawable.music_guy, R.drawable.mustache_guy, R.drawable.orange_guy, R.drawable.t_l_chargement)
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
        myavatar = findViewById(R.id.myAvatar)

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
        avatarButton = findViewById<Button>(R.id.avatar)
        avatarButton.setOnClickListener {
        chooseAvatar(this)
        }

    }

    private fun takeImageFromCamera(){
        val takePicture = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        resultLauncher.launch(takePicture)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>,
                                            grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            1 -> {
                if (grantResults.isNotEmpty() && grantResults[0] ==
                    PackageManager.PERMISSION_GRANTED) {
                    if ((ContextCompat.checkSelfPermission(this,
                            Manifest.permission.CAMERA) ===
                            PackageManager.PERMISSION_GRANTED)) {
                        Toast.makeText(this, "Permission Granted", Toast.LENGTH_SHORT).show()
                        takeImageFromCamera()
                    }
                } else {
                    Toast.makeText(this, "Permission Denied", Toast.LENGTH_SHORT).show()
                }
                return
            }
        }
    }

    private fun checkAndRequestPermissions(): Boolean {
        if (Build.VERSION.SDK_INT >= 23) {
            val cameraPermission =
                ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            if (cameraPermission == PackageManager.PERMISSION_DENIED) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.CAMERA),
                    20
                )
                return false
            }
        }
        return true
    }

    var resultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            val bundle = data?.extras
            val bitmapImage = bundle?.get("data") as Bitmap
            myavatar.setImageBitmap(bitmapImage)
            encodeImageToBase64(bitmapImage)
            Log.d("nouveau", bitmapImage.toString())
        }
    }


    fun chooseAvatar(context: Context) {
            var avatarDialog = Dialog(context.applicationContext)
            avatarDialog.setContentView(R.layout.avatar_choice)
            val recycler = avatarDialog.findViewById<RecyclerView>(R.id.avatar_image_list)
            recycler.setHasFixedSize(true)
            recycler.layoutManager = GridLayoutManager(application, 3)
            val avatarListAdapter = AvatarAdapter(avatarSrcImages)
            recycler.adapter = avatarListAdapter
            val addAvatarId = resources.getIdentifier("t_l_chargement", "drawable", packageName)
            Log.d("cameraId", addAvatarId.toString())
            avatarDialog.show()
            avatarListAdapter.onClickAvatar = { position ->
                myavatar.setImageResource(avatarSrcImages[position])

                //convert to base64 to coord with heavy client
                encodeImageToBase64(myavatar.drawable.toBitmap())

                avatarButton.setVisibility(View.INVISIBLE)
                avatarDialog.hide()
                if(context.applicationContext == RegisterActivity()) {
                    changeAvatar()
                }
                Log.d("avatarpath", avatarSrcImages[position].toString())
                if(addAvatarId == avatarSrcImages[position]) {
                    if(checkAndRequestPermissions()) {
                        takeImageFromCamera()
                    }
                }

        }
    }

    fun encodeImageToBase64(bmp: Bitmap) {
        var baos = ByteArrayOutputStream()
        bmp.compress(Bitmap.CompressFormat.JPEG, 100, baos)
        var avatarByte = baos.toByteArray()
        var encodeAvatar = Base64.encodeToString(avatarByte, Base64.NO_WRAP)
        user.avatar = "data:image/jpeg;base64," + encodeAvatar
    }

    private suspend fun onRegister() {
        val emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+"
        val passwordPattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}"
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
        else if(!password.matches(passwordPattern.toRegex())) {
            Toast.makeText(this, "Le mot de passe doit contenir au moins 8 caracteres, 1 majuscule, 1 minuscule et 1 caractère spécial.", Toast.LENGTH_LONG).show()
            return
        }
        else if(password != confirmPassword) {
            Toast.makeText(this, "Les deux mots de passe ne correspondent pas", Toast.LENGTH_LONG).show()
            return
        }
        user.pseudonym = pseudonym
        user.password = password
        user.email = email
        val pseudonymResponse = checkPseudonym(user)
        if (pseudonymResponse != null) {
            val checked: String = pseudonymResponse.body()
            if(checked == "true"){
                Toast.makeText(this, "Ce pseudonyme existe déjà", Toast.LENGTH_LONG).show()
                return;
            }
        }

        if(user.avatar == "") {
            Toast.makeText(this, "Veuillez choisir un avatar", Toast.LENGTH_LONG).show()
            return;
        }
        Log.d("avant", "registration")
        val registerResponse = postRegistration(user)
        if(registerResponse != null) {
                Toast.makeText(
                    this,
                    "Votre compte a bien été créé, veuillez vous connecter.",
                    Toast.LENGTH_LONG
                ).show()
                startActivity(Intent(this, ConnectionActivity::class.java))
        }

    }

    fun changeAvatar() {
        val changeAvatar = findViewById<TextView>(R.id.change_avatar)
        val mString ="Changer d'avatar"
        val mSpannableString = SpannableString(mString)
        mSpannableString.setSpan(UnderlineSpan(), 0, mSpannableString.length, 0)
        changeAvatar.text = mSpannableString
        changeAvatar.setOnClickListener {
            chooseAvatar(this)
        }
    }

    suspend fun checkPseudonym(user: User): HttpResponse? {
        var response: HttpResponse?
        try {
            response = client.get(resources.getString(R.string.http)+user.ipAddress+ "/api/user/checkPseudonym/"+user.pseudonym){
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
