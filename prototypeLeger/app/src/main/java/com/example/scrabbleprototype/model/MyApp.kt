package com.example.scrabbleprototype.model

import android.app.Application
import android.util.Log

class MyApp: Application() {
    override fun onCreate() {
        super.onCreate()
        // Filling Profiles lists for the 1st time the app is launched

        // this method fires once as well as constructor
        // but also application has context here
        Log.i("main", "onCreate fired")
    }

    init {
        // this method fires only once per application start.
        // getApplicationContext returns null here
        Log.i("main", "Constructor fired")
    }
}
