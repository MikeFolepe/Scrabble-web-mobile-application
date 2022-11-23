package com.example.scrabbleprototype.fragments

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentFeaturesBinding
import com.example.scrabbleprototype.databinding.FragmentLetterRackBinding
import com.example.scrabbleprototype.objects.ThemeManager

class FeaturesFragment : Fragment() {

    private lateinit var binding: FragmentFeaturesBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentFeaturesBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
    }
}
