package com.example.scrabbleprototype.fragments

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.databinding.ObservableField
import androidx.fragment.app.findFragment
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.Player
import com.example.scrabbleprototype.services.SkipTurnCallback

import com.example.scrabbleprototype.services.SkipTurnService
import com.example.scrabbleprototype.services.SwapLetterService
import kotlin.math.min

class InformationPannelFragment : Fragment(), SkipTurnCallback {

    val player = Player

    private var timeMs: Long = 0
    private lateinit var timerText: TextView

    private lateinit var skipTurnService: SkipTurnService
    private var skipTurnBound: Boolean = false
    lateinit var activityContext: Context

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as SkipTurnService.LocalBinder
            skipTurnService = binder.getService()
            skipTurnBound = true
            skipTurnService.setCallbacks(this@InformationPannelFragment)
            skipTurnService.startTimer(timeMs)
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            skipTurnBound = false
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_information_pannel, container, false)
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        timerText = view.findViewById(R.id.timer)
        updateTimeUI(timeMs)
        timeMs = 60000
        updateTimeUI(timeMs)
        player.setTurn(true)
    }

    override fun onStart() {
        super.onStart()
        Intent(activityContext, SkipTurnService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
    }

    override fun onStop() {
        super.onStop()
        skipTurnService.setCallbacks(null)
        activityContext.unbindService(connection)
        skipTurnBound = false
    }

    override fun updateTimeUI(currentTime: Long) {
        activity?.runOnUiThread {
            val minutes = (currentTime / 1000) / 60
            val seconds = (currentTime / 1000) % 60
            var minutesString = ""
            var secondsString = ""
            if(minutes < 10) minutesString = "0$minutes"
            else minutesString = "$minutes"
            if(seconds < 10) secondsString = "0$seconds"
            else secondsString = "$seconds"

            timerText.text = minutesString + ":" + secondsString
        }
    }
}
