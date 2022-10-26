package com.example.scrabbleprototype.activities

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Spinner
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.Dictionary
import com.example.scrabbleprototype.model.Users
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
import org.json.JSONArray
import kotlin.coroutines.CoroutineContext

class CreateGameActivity : AppCompatActivity(), CoroutineScope {
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }

    val minutes = arrayListOf<String>("00", "01", "02", "03")
    val seconds = arrayListOf<String>("00", "30")
    var dictionariesTitle =  arrayListOf<String>()
    var timerSet = arrayListOf<String>("00", "00")
    lateinit var client: HttpClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_game_2)

        client = HttpClient() {
            install(ContentNegotiation) {
                json()
            }
        }
        Log.d("ipadress", Users.ipAddress)

        setupSpinners()
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
                Log.d("if response", "yes")
                val stringBody: String = response.body();
                val mapper = jacksonObjectMapper()
                Log.d("dico", stringBody)
                val dictionary:List<Dictionary> = mapper.readValue(stringBody, object: TypeReference<List<Dictionary>>() {})
                Log.d("dico", dictionary.toString())
                    for (i in 0 until dictionary.size) {
                        val dicoToAdd = mapper.readValue(dictionary.get(i).toString(), Dictionary::class.java)
                       dictionariesTitle.add(dicoToAdd.title)
                   }
                    }
            Log.d("dico", dictionariesTitle.toString())
            }

        //dicoSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, dictionary)

        handleMinutesSelection(minutesSpinner)
        handleSecondesSelection(secondsSpinner)

        minutesSpinner.setSelection(1)
    }

    suspend fun getDictionaries(): HttpResponse? {
        var response: HttpResponse?
        try {
            Log.d("try", "yes")
            response = client.get(Users.ipAddress + "/api/admin/dictionaries") {
                contentType(ContentType.Application.Json)
            }
        } catch (err: Exception) {
           response = null
        }
        Log.d("response", response.toString())
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
                timerSet[0]=minutes[position]
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
                timerSet[1] = seconds[position]
                Log.d("spinner", seconds[position])
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
            }

        }
    }
}
