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
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentGameButtonsBinding
import com.example.scrabbleprototype.databinding.FragmentInformationPannelBinding
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.model.Player
import com.example.scrabbleprototype.model.PlayersAdapter
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.Reserve
import com.example.scrabbleprototype.services.SkipTurnService
import com.example.scrabbleprototype.services.TurnUICallback
import com.example.scrabbleprototype.viewModel.PlacementViewModel
import com.example.scrabbleprototype.viewModel.PlayersViewModel

class InformationPannelFragment : Fragment(), TurnUICallback {

    val player = Players.currentPlayer
    private lateinit var playersAdapter: PlayersAdapter
    private lateinit var playersView: RecyclerView

    private val playersViewModel: PlayersViewModel by activityViewModels()
    private var _binding: FragmentInformationPannelBinding? = null
    private val binding get() = _binding!!

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
            skipTurnService.setTurnUICallback(this@InformationPannelFragment)
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
        _binding = FragmentInformationPannelBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<ConstraintLayout>(R.id.info_pannel_layout).setOnClickListener {
            skipTurnService.setTurnUICallback(this@InformationPannelFragment)
        }
        setupPlayers(view)
        setupReserveSize(view)
    }

    override fun onStart() {
        super.onStart()
        Intent(activityContext, SkipTurnService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
    }

    override fun onStop() {
        super.onStop()
        skipTurnService.setTurnUICallback(null)
        activityContext.unbindService(connection)
        skipTurnBound = false
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun setupPlayers(view: View) {
        playersViewModel.initializePlayersOrder()

        val playerObserver = Observer<Int> { playerUpdatedPosition ->
            playersAdapter.notifyItemChanged(playerUpdatedPosition)
        }
        playersViewModel.playerUpdatedPosition.observe(viewLifecycleOwner, playerObserver)

        playersView = view.findViewById(R.id.players)
        val verticalLayoutManager = LinearLayoutManager(activity, LinearLayoutManager.VERTICAL, false)
        playersView.layoutManager = verticalLayoutManager
        playersAdapter = PlayersAdapter(playersViewModel.playersInGame)
        playersView.adapter = playersAdapter
    }

    private fun setupReserveSize(view: View) {
        binding.reserve = Reserve
    }

    override fun updateTimeUI(currentTime: Long, activePlayerName: String) {
        activity?.runOnUiThread {
            val minutes = (currentTime / 1000) / 60
            val seconds = (currentTime / 1000) % 60
            var minutesString = ""
            var secondsString = ""
            minutesString = if(minutes < 10) "0$minutes"
                            else "$minutes"
            secondsString = if(seconds < 10) "0$seconds"
                            else "$seconds"

            val activePlayerIndex = playersViewModel.playersInGame.indexOfFirst { it.name == activePlayerName }
            val timerView = playersView.findViewHolderForAdapterPosition(activePlayerIndex)?.itemView?.findViewById<TextView>(R.id.timer)
            timerView?.text = minutesString + ":" + secondsString
        }
    }
}
