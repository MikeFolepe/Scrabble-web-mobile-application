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
import android.widget.Button
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.constraintlayout.widget.ConstraintSet.Constraint
import androidx.core.content.ContextCompat
import androidx.databinding.BaseObservable
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
import com.example.scrabbleprototype.objects.*
import com.example.scrabbleprototype.services.SkipTurnService
import com.example.scrabbleprototype.services.TurnUICallback
import com.example.scrabbleprototype.viewModel.PlacementViewModel
import com.example.scrabbleprototype.viewModel.PlayersViewModel
import com.fasterxml.jackson.module.kotlin.jacksonMapperBuilder
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import java.util.*
import kotlin.concurrent.timerTask

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
        receiveNewPlayer()
    }

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            if(service is SkipTurnService.LocalBinder) {
                skipTurnService = service.getService()
                skipTurnBound = true
                skipTurnService.setTurnUICallback(this@InformationPannelFragment)
            }
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
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        _binding = FragmentInformationPannelBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Intent(activityContext, SkipTurnService::class.java).also { intent ->
            activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }

        view.findViewById<ConstraintLayout>(R.id.info_pannel_layout).setOnClickListener {
            skipTurnService.setTurnUICallback(this@InformationPannelFragment)
        }
        setupPlayers(view)
        setupReserveSize(view)

        Timer().schedule(timerTask {
            receiveTimer()
        }, 3000)
    }

    override fun onStart() {
        super.onStart()
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

    override fun updateTimeUI(minutes: String, seconds: String, activePlayerName: String) {
        activity?.runOnUiThread {
            val minutesDisplay = if(minutes.toInt() < 10) "0$minutes"
                            else minutes
            val secondsDisplay = if(seconds.toInt() < 10) "0$seconds"
                            else seconds

            val activePlayerIndex = playersViewModel.playersInGame.indexOfFirst { it.name == activePlayerName }
            val activePlayerView = playersView.findViewHolderForAdapterPosition(activePlayerIndex)?.itemView
            val timerView = activePlayerView?.findViewById<TextView>(R.id.timer)
            val timerTitleView = activePlayerView?.findViewById<TextView>(R.id.timer_title)
            timerView?.text = getString(R.string.timer_format, minutesDisplay, secondsDisplay)
            setTimeUiColor(timerView, timerTitleView, minutes.toInt() + seconds.toInt())
        }
    }

    private fun receiveNewPlayer(){
        SocketHandler.socket.on("newPlayer") { response ->
            val newPlayer = jacksonObjectMapper().readValue(response[0].toString(), Player::class.java)
            val position = response[1] as Int
            Players.players[position] = newPlayer
            activity?.runOnUiThread {
                playersAdapter.updateData(Players.players)
            }
            if(Users.currentUser.pseudonym == newPlayer.name){
                Players.setCurrent(newPlayer)
                Players.currentPlayer.updateCurrentPlayer()

            }

        }
    }

    private fun setTimeUiColor(timerView: TextView?, timerTitleView: TextView?, currentTime: Int) {
        if(currentTime == 0) {
            timerView?.setTextColor(ContextCompat.getColor(timerView.context, R.color.white))
            timerTitleView?.setTextColor(ContextCompat.getColor(timerTitleView.context, R.color.white))
        } else{
            timerView?.setTextColor(ContextCompat.getColor(timerView.context, R.color.lime_green))
            timerTitleView?.setTextColor(ContextCompat.getColor(timerTitleView.context, R.color.lime_green))
        }
    }

    private fun receiveTimer() {
        SocketHandler.socket.on("updateTimer") { response ->
            if(skipTurnService == null) {
                Log.d("nullservice", "??")
                Intent(activityContext, SkipTurnService::class.java).also { intent ->
                    activityContext.bindService(intent, connection, Context.BIND_AUTO_CREATE)
                }
            }

            val minutes = response[0].toString()
            val seconds = response[1].toString()
            updateTimeUI(minutes, seconds, skipTurnService.activePlayerName)
        }
    }
}
