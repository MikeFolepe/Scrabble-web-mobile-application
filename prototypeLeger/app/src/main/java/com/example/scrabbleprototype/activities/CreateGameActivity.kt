package com.example.scrabbleprototype.activities

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Adapter
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Spinner
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.User
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import java.lang.Exception
import kotlin.math.min

class CreateGameActivity : AppCompatActivity() {

    val minutes = arrayListOf<String>("00", "01", "02", "03")
    val seconds = arrayListOf<String>("00", "30")
    val dictionary = arrayListOf<String>("Francais")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_game_2)

        setupSpinners()
    }

    private fun setupSpinners() {
        val minutesSpinner = findViewById<Spinner>(R.id.spinner_minutes)
        val secondsSpinner = findViewById<Spinner>(R.id.spinner_secondes)
        val dicoSpinner = findViewById<Spinner>(R.id.spinner_dictionary)

        minutesSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, minutes)
        secondsSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, seconds)
        dicoSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, dictionary)

        handleMinutesSelection(minutesSpinner)
        handleSecondesSelection(secondsSpinner)

        minutesSpinner.setSelection(1)
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

    private fun handleMinutesSelection(minutesSpinner: Spinner) {
        minutesSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
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
                Log.d("spinner", seconds[position])
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
            }

        }
    }
}
