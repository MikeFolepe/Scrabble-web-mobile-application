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
import kotlin.math.min

class CreateGameActivity : AppCompatActivity() {

    val minutes = arrayListOf<String>("0", "1", "2", "3")
    val seconds = arrayListOf<String>("00", "30")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_game)

        setupSpinners()
    }

    private fun setupSpinners() {
        val minutesSpinner = findViewById<Spinner>(R.id.spinner_minutes)
        val secondsSpinner = findViewById<Spinner>(R.id.spinner_secondes)

        minutesSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, minutes)
        secondsSpinner.adapter = ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, seconds)

        handleMinutesSelection(minutesSpinner)

        minutesSpinner.setSelection(1)
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
}
