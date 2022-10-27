package com.example.scrabbleprototype.fragments

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.database.DatabaseUtils
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.databinding.DataBindingUtil
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentGameButtonsBinding
import com.example.scrabbleprototype.objects.Player
import com.example.scrabbleprototype.services.SkipTurnService

class GameButtonsFragment : Fragment() {
    private val player = Player

    private lateinit var skipTurnService: SkipTurnService
    private var skipTurnBound: Boolean = false
    private lateinit var activityContext: Context

    private var _binding: FragmentGameButtonsBinding? = null
    private val binding get() = _binding!!

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as SkipTurnService.LocalBinder
            skipTurnService = binder.getService()
            skipTurnBound = true
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            skipTurnBound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        _binding = FragmentGameButtonsBinding.inflate(inflater, container, false)
        binding.skipTurnButton.setOnClickListener {
            skipTurn()
        }
        binding.playerTurn = player.isTurn
        binding.playTurnButton.setOnClickListener {
            Log.d("timer", binding.skipTurnButton.isEnabled.toString() + "BUTT")
            Log.d("timer", player.isTurn.toString() + "WHY")
            Log.d("timer", binding.playerTurn.toString() + "THIS")
        }

        return binding.root
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }

    override fun onStop() {
        super.onStop()
        activityContext.unbindService(connection)
        skipTurnBound = false
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Intent(activityContext, SkipTurnService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun skipTurn() {
        Log.d("timer", binding.skipTurnButton.isEnabled.toString() + "BUTT")
        skipTurnService.switchTimer()
    }
}
