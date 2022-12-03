package com.example.scrabbleprototype.activities.menus.statistics

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.databinding.FragmentStatsBinding
import com.example.scrabbleprototype.model.Connection
import com.example.scrabbleprototype.model.ConnectionAdapter
import com.example.scrabbleprototype.model.Game
import com.example.scrabbleprototype.model.GameHistoryAdapter
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.PreferenceViewModel
import com.example.scrabbleprototype.viewModel.StatsViewmodel

class StatsFragment : Fragment() {

    private val user = Users.currentUser
    private val userStats = Users.userStats

    private val statsViewModel: StatsViewmodel by activityViewModels()
    private lateinit var binding: FragmentStatsBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment

        statsViewModel.updateStats()
        val statsObserver = Observer<Boolean> { areStatsInit ->
            if(areStatsInit) setupStats()
        }
        statsViewModel.areStatsInit.observe(viewLifecycleOwner, statsObserver)
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentStatsBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    private fun setupStats() {
        binding.gamesPlayed.text = userStats.gamesPlayed.toString()
        binding.gamesWon.text = userStats.gamesWon.toString()
        binding.averagePoints.text = userStats.getAveragePoints().toString()
        binding.averageTime.text = userStats.getAverageTime()
        setupConnections()
        setupGamesHistory()
    }

    private fun setupConnections() {
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
        val gamesHistoryView = binding.gamesHistory
        gamesHistoryView.layoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.VERTICAL, false)
        val gamesHistoryAdapter = GameHistoryAdapter(userStats.games)
        gamesHistoryView.adapter = gamesHistoryAdapter
    }
}
