package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import android.util.Log

class SwapLetterService : Service() {

    private val binder = LocalBinder()

    inner class LocalBinder: Binder() {
        fun getService(): SwapLetterService = this@SwapLetterService
    }

    override fun onBind(intent: Intent): IBinder {
        return binder
    }

    fun testService() {
        Log.d("service", "SWAP HAS bEEN CALLED")
    }
}
