package com.example.scrabbleprototype.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.Spinner
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject
import java.util.ArrayList
import kotlin.coroutines.CoroutineContext

class CreateGameActivity : AppCompatActivity(), CoroutineScope {
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }
    var currentRoom = CurrentRoom;
    var gameSetting: GameSettings = GameSettings(arrayListOf(Users.currentUser), StartingPlayer.Player1, "00", "00", AiType.beginner, "", "", "", arrayOf())
    val minutes = arrayListOf("00", "01", "02", "03")
    val seconds = arrayListOf("00", "30")
    var dictionariesTitle =  arrayListOf<String>()
    lateinit var client: HttpClient
    val playerSocket = SocketHandler.getPlayerSocket()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_game_2)

        client = HttpClient() {
            install(ContentNegotiation) {
                json()
            }
        }
        setupSpinners()
        setUpButtons()
    }

    fun setupSpinners() {
        val minutesSpinner = findViewById<Spinner>(R.id.spinner_minutes)
        val secondsSpinner = findViewById<Spinner>(R.id.spinner_secondes)
        val dicoSpinner = findViewById<Spinner>(R.id.spinner_dictionary)

        minutesSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, minutes)
        secondsSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, seconds)

        launch {
            val response = getDictionaries()
            if(response != null) {
                val stringBody: String = response.body();
                val mapper = jacksonObjectMapper()
                val dictionary: List<Dictionary> = mapper.readValue(stringBody, object: TypeReference<List<Dictionary>>() {})
                for (i in 0 until dictionary.size) {
                       dictionariesTitle.add(dictionary[i].title)
                }
            }
            Log.d("dico", dictionariesTitle.toString())
        }
        dicoSpinner!!.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, dictionariesTitle)

        handleMinutesSelection(minutesSpinner)
        handleSecondesSelection(secondsSpinner)
        handleDictionarySelection(dicoSpinner)

        minutesSpinner.setSelection(1)
        dicoSpinner.setSelection((0))
    }

    suspend fun getDictionaries(): HttpResponse? {
        var response: HttpResponse?
        try {
            response = client.get(Users.ipAddress + "/api/admin/dictionaries") {
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
                gameSetting.dictionary = dictionariesTitle[position]
                Log.d("dico", dictionariesTitle[position])
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
            }

        }
    }

    private fun setUpButtons() {
        val continueGameButton = findViewById<Button>(R.id.continue_button)
        continueGameButton.setOnClickListener {
            createGame(this.gameSetting)
            startActivity(Intent(this, WaitingRoomActivity::class.java))

        }
        val backButton = findViewById<Button>(R.id.back_button)
        backButton.setOnClickListener {
            startActivity(Intent(this, HomeMenuActivity::class.java))
        }
    }

    private fun createGame (gameSetting: GameSettings) {
        val gameType = 0;
        playerSocket.on("yourRoomId") { response ->
            var roomReceived = Room(response[0].toString(), arrayListOf(playerSocket.id()), gameSetting, State.Waiting)
            currentRoom.myRoom = roomReceived;
        }
        playerSocket.emit("createRoom", JSONObject(Json.encodeToString(gameSetting)), Json.encodeToString(gameType))
    }
}
