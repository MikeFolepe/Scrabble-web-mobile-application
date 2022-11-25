package com.example.scrabbleprototype.activities.menus.home

import android.content.Intent
import android.graphics.drawable.AnimationDrawable
import android.graphics.drawable.TransitionDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.ViewModelProvider
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.activities.CreateGameActivity
import com.example.scrabbleprototype.activities.GameActivity
import com.example.scrabbleprototype.activities.JoinGameActivity
import com.example.scrabbleprototype.databinding.FragmentHomeBinding
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.PreferenceViewModel

class HomeFragment : Fragment() {

    private val user = Users.currentUser

    private val preferenceViewModel: PreferenceViewModel by activityViewModels()
    private var _binding: FragmentHomeBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?): View {
        val homeViewModel = ViewModelProvider(this)[HomeViewModel::class.java]

        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        _binding = FragmentHomeBinding.inflate(inflaterWithTheme)
        val root: View = binding.root

        setupUserInfo()
        setupButtons()
        return root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun setupUserInfo() {
        binding.userInfoName.text = user.pseudonym
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
