package com.example.scrabbleprototype.activities

import android.app.Dialog
import android.content.DialogInterface
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject
import kotlin.coroutines.CoroutineContext


class CreateGameActivity : AppCompatActivity(), CoroutineScope {
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }
    var dicoFileName= ""
    var currentRoom = CurrentRoom;
    var gameSetting: GameSettings = GameSettings(Users.currentUser.pseudonym, StartingPlayer.Player1, "00", "00", AiType.beginner, "", RoomType.public)
    val minutes = arrayListOf("00", "01", "02", "03")
    val seconds = arrayListOf("00", "30")
    var dictionaries = listOf<Dictionary>()
    var dictionariesTitle =  arrayListOf<String>()
    lateinit var client: HttpClient
    val socket = SocketHandler.getPlayerSocket()

    val mapper = jacksonObjectMapper()

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_game_2)

        client = HttpClient() {
            install(ContentNegotiation) {
                json()
            }
        }
        receiveMyPlayer()
        setUpButtons()
        receiveMyPlayer()
        currRoom()
        receiveAis()
        launch { setupSpinners() }
    }

    suspend fun setupSpinners() {
        val minutesSpinner = findViewById<Spinner>(R.id.spinner_minutes)
        val secondsSpinner = findViewById<Spinner>(R.id.spinner_secondes)
        val dicoSpinner = findViewById<Spinner>(R.id.spinner_dictionary)

        minutesSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, minutes)
        secondsSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, seconds)
        handleMinutesSelection(minutesSpinner)
        handleSecondesSelection(secondsSpinner)
        minutesSpinner.setSelection(1)

            val response = async{ getDictionaries()}
            val dico = response.await()
            if(dico != null) {
                val stringBody: String = dico.body();
                val mapper = jacksonObjectMapper()
                dictionaries = mapper.readValue(stringBody, object: TypeReference<List<Dictionary>>() {})
                for (i in 0 until dictionaries.size) {
                       dictionariesTitle.add(dictionaries[i].title)
                }
            }
            Log.d("dico", dictionariesTitle.toString())

        dicoSpinner!!.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, dictionariesTitle)
        handleDictionarySelection(dicoSpinner)
        dicoSpinner.setSelection(0)

    }

    suspend fun getDictionaries(): HttpResponse? {
        var response: HttpResponse?
        try {
            response = client.get(Users.currentUser.ipAddress + "/api/admin/dictionaries") {
                contentType(ContentType.Application.Json)
            }
        } catch (err: Exception) {
           response = null
        }
        return response
    }

    private fun handleMinutesSelection(minutesSpinner: Spinner) {
        minutesSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                gameSetting.timeMinute=minutes[position]
                Log.d("spinner", minutes[position])
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
            }

        }
    }
    private fun handleSecondesSelection(secondsSpinner: Spinner) {
        secondsSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                gameSetting.timeSecond = seconds[position]
                Log.d("spinner", seconds[position])
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
            }

        }
    }

    private fun handleDictionarySelection(dicoSpinner: Spinner) {
        dicoSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                gameSetting.dictionary = dictionaries.find { it.title == dictionariesTitle[position] }!!.fileName
                Log.d("dico", gameSetting.dictionary)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
            }

        }
    }

    private fun setUpButtons() {
        val continueGameButton = findViewById<Button>(R.id.continue_button)
        continueGameButton.setOnClickListener {
            createGame(this.gameSetting)
        }
        val backButton = findViewById<Button>(R.id.back_button)
        backButton.setOnClickListener {
            startActivity(Intent(this, MainMenuActivity::class.java))
        }
        findViewById<RadioGroup>(R.id.radio_group).setOnCheckedChangeListener { group, checkedId ->
            val radio: RadioButton = findViewById(checkedId)
            if (radio.text == "Public") {
                gameSetting.type = RoomType.public;
                val builder = AlertDialog.Builder(this)
                builder.setMessage("Voulez vous protégez la partie en ajoutant un mot de passe");
                // Set Alert Title
                builder.setTitle("Mot de passe partie public");

                // Set Cancelable false for when the user clicks on the outside the Dialog Box then it will remain show
                builder.setCancelable(false);
                builder.setPositiveButton("Yes",
                    DialogInterface.OnClickListener { dialog: DialogInterface, which: Int ->
                        // When the user click yes button then app will close
                        var pwdDialog = Dialog(this)
                        pwdDialog.setContentView(R.layout.public_game_pwd)
                        pwdDialog.show()
                        val validateButton = pwdDialog.findViewById<Button>(R.id.validate_button)
                        validateButton.setOnClickListener {
                            Log.d("button", "accept")
                            val passwordInput = pwdDialog.findViewById<EditText>(R.id.popup_window_text);
                            this.gameSetting.password = passwordInput.text.toString()
                            pwdDialog.hide()
                            dialog.cancel()
                            Toast.makeText(this, "Le mot de passe a été configuré. Appuyez sur Continuer", Toast.LENGTH_LONG).show()
                        }
                        val backButton = pwdDialog.findViewById<Button>(R.id.back_button)
                        backButton.setOnClickListener {
                            pwdDialog.hide()
                        }
                    })
                // Set the Negative button with No name Lambda OnClickListener method is use of DialogInterface interface.
                builder.setNegativeButton("No",
                    DialogInterface.OnClickListener { dialog: DialogInterface, which: Int ->
                        // If user click no then dialog box is canceled.
                        dialog.cancel()
                    } as DialogInterface.OnClickListener)
                // Create the Alert dialog

                val alertDialog = builder.create()
                // Show the Alert Dialog box
                alertDialog.show()
            } else {
                gameSetting.type = RoomType.private;
            }
            Log.d("type:", gameSetting.type.toString())
        }
    }

    private fun createGame (gameSetting: GameSettings) {
        socket.on("yourRoomId") { response ->
            val roomReceived = Room(response[0].toString(), arrayListOf(socket.id()), gameSetting, State.Waiting, 3 , 1, arrayListOf())
            currentRoom.myRoom = roomReceived;
        }
        //gameSetting.dictionary = dictionaries.find { it.title == dicoFileName }!!.fileName
        gameSetting.dictionary = dictionaries[0].fileName
        Log.d("game" , gameSetting.toString())
        socket.emit("createRoom", JSONObject(Json.encodeToString(gameSetting)))
    }


    private fun currRoom() {
        socket.on("yourRoom") {response ->
            var myRoom =  mapper.readValue(response[0].toString(), Room::class.java)
            CurrentRoom.myRoom =  myRoom
            SocketHandler.roomId = myRoom.id
        }
    }


    private fun receiveMyPlayer() {
        socket.on("MyPlayer") { response ->
            Players.currentPlayer = mapper.readValue(response[0].toString(), Player::class.java)
            Log.d("waiting11", Players.currentPlayer.name)
            startActivity(Intent(this, WaitingRoomActivity::class.java))
        }
    }

    private fun receiveAis() {
        socket.on("roomPlayers") { response ->
            Log.d("roomPlayers", "create")
            Players.players = mapper.readValue(response[0].toString(), object: TypeReference<ArrayList<Player>>() {})
        }
    }
}
