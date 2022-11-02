package com.example.scrabbleprototype.fragments

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.*
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.constraintlayout.widget.ConstraintSet.Constraint
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.services.SkipTurnCallback
import com.example.scrabbleprototype.services.SkipTurnService

class InformationPannelFragment : Fragment(), SkipTurnCallback {

    val player = Players.currentPlayer

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

        view.findViewById<ConstraintLayout>(R.id.info_pannel_layout).setOnClickListener {
            skipTurnService.setCallbacks(this@InformationPannelFragment)
        }
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
            minutesString = if(minutes < 10) "0$minutes"
                            else "$minutes"
            secondsString = if(seconds < 10) "0$seconds"
                            else "$seconds"
            timerText.text = minutesString + ":" + secondsString
        }
    }
}
