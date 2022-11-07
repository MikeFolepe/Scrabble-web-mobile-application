package com.example.scrabbleprototype.activities.menus.home

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.scrabbleprototype.activities.CreateGameActivity
import com.example.scrabbleprototype.activities.GameActivity
import com.example.scrabbleprototype.activities.JoinGameActivity
import com.example.scrabbleprototype.databinding.FragmentHomeBinding

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val homeViewModel =
            ViewModelProvider(this)[HomeViewModel::class.java]

        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        val root: View = binding.root

        setupButtons()
        return root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun setupButtons() {
        binding.createGameButton.setOnClickListener {
            startActivity(Intent(activity, CreateGameActivity::class.java))
        }
        binding.joinGamesButton.setOnClickListener {
            startActivity(Intent(activity, JoinGameActivity::class.java))
        }
        binding.gameViewButton.setOnClickListener {
            startActivity(Intent(activity, GameActivity::class.java))
        }
    }
}
