package com.example.scrabbleprototype.activities.menus.statistics

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.databinding.FragmentStatsBinding
import com.example.scrabbleprototype.model.Connection
import com.example.scrabbleprototype.model.ConnectionAdapter
import com.example.scrabbleprototype.model.Game
import com.example.scrabbleprototype.model.GameHistoryAdapter
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users

class StatsFragment : Fragment() {

    private val user = Users.currentUser
    private val userStats = Users.userStats

    private lateinit var binding: FragmentStatsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentStatsBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupStats()
        setupConnections()
        setupGamesHistory()
    }

    private fun setupStats() {
        userStats.gamesPlayed = 44
        userStats.gamesWon = 30
        userStats.totalPoints = 4500
        userStats.totalTimeMS = 30000000

        binding.gamesPlayed.text = userStats.gamesPlayed.toString()
        binding.gamesWon.text = userStats.gamesWon.toString()
        binding.averagePoints.text = userStats.getAveragePoints().toString()
        binding.averageTime.text = userStats.getAverageTime()
    }

    private fun setupConnections() {
        for(i in 0 until 10) {
            userStats.logins.add(Connection("01/11/2022", "16:30:21", true))
            userStats.logouts.add(Connection("01/11/2022", "18:21:05", false))
        }

        val loginsView = binding.logins
        loginsView.layoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.VERTICAL, false)
        val loginsAdapter = ConnectionAdapter(userStats.logins)
        loginsView.adapter = loginsAdapter

        val logoutsView = binding.logouts
        logoutsView.layoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.VERTICAL, false)
        val logoutsAdapter = ConnectionAdapter(userStats.logouts)
        logoutsView.adapter = logoutsAdapter
    }

    private fun setupGamesHistory() {
        for(i in 0 until 10) {
            if( i % 2 == 0) userStats.games.add(Game("12/11/2022", "12:45:00", user.pseudonym))
            else userStats.games.add(Game("12/11/2022", "12:45:00", "opponent"))
        }

        val gamesHistoryView = binding.gamesHistory
        gamesHistoryView.layoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.VERTICAL, false)
        val gamesHistoryAdapter = GameHistoryAdapter(userStats.games)
        gamesHistoryView.adapter = gamesHistoryAdapter
    }
}
