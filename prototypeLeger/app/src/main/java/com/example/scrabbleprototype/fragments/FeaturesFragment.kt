package com.example.scrabbleprototype.fragments

import android.os.Bundle
import android.os.Environment
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.content.res.AppCompatResources
import androidx.core.content.ContextCompat
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentFeaturesBinding
import com.example.scrabbleprototype.databinding.FragmentLetterRackBinding
import com.example.scrabbleprototype.model.Constants
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import io.ktor.client.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.lang.Exception
import kotlin.coroutines.CoroutineContext

class FeaturesFragment : Fragment(), CoroutineScope {

    private var dictionaryVerifLeft = Constants.DICTIONARY_VERIF_NUMBER

    private var client = HttpClient() {
        install(ContentNegotiation) {}
    }
    private lateinit var binding: FragmentFeaturesBinding
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + job

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

        setupDictionaryVerif()
    }

    private fun setupDictionaryVerif() {
        binding.dictionaryUtilisation.text = getString(R.string.dictionary_verif_left, dictionaryVerifLeft)

        binding.dictionaryVerifBuy.setOnClickListener {
            val wordToVerify = binding.dictionaryVerifInput.text.toString()
            if(dictionaryVerifLeft == 0) {
                binding.dictionaryUtilisation.error = "Vous avez 0 utilisations restantes"
                Toast.makeText(requireContext(), "Impossible de vérifier un mot: Vous avez 0 utilisations restantes", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            if(wordToVerify.isEmpty()) {
                binding.dictionaryVerifInput.error = "Ce champ ne peut pas être vide"
                return@setOnClickListener
            }
            if(Users.currentUser.xpPoints < Constants.DICTIONARY_VERIF_PRICE) {
                Toast.makeText(requireContext(), "Impossible de vérifier un mot: Vous n'avez pas assez de points XP", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            Users.currentUser.xpPoints -= Constants.DICTIONARY_VERIF_PRICE
            dictionaryVerifLeft -= 1
            binding.dictionaryUtilisation.text = getString(R.string.dictionary_verif_left, dictionaryVerifLeft)

            launch {
                val isValid = isWordInDictionary(wordToVerify)
                activity?.runOnUiThread {
                    if(isValid) binding.dictionaryVerifResult.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.ic_baseline_check_24))
                    else binding.dictionaryVerifResult.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.ic_baseline_highlight_off_24))
                }
            }
        }
    }

    private suspend fun isWordInDictionary(word: String): Boolean {
        var response: HttpResponse?
        try{
            response = client.get(environments.Environment.serverUrl + "/api/game/dictionaryVerif/" + word + "/" + CurrentRoom.myRoom.gameSettings.dictionary) {}
        } catch(e: Exception) {
            response = null
        }
        return response?.status == HttpStatusCode.OK
    }
}
