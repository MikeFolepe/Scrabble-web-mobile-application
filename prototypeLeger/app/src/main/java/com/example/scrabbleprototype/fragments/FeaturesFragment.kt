package com.example.scrabbleprototype.fragments

import android.app.Dialog
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.view.ContextThemeWrapper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentFeaturesBinding
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.*
import com.example.scrabbleprototype.services.PlaceService
import com.example.scrabbleprototype.services.SkipTurnService
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import environments.Environment
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
import java.util.*
import kotlin.collections.ArrayList
import kotlin.concurrent.timerTask
import kotlin.coroutines.CoroutineContext

class FeaturesFragment : Fragment(), CoroutineScope {

    private var dictionaryVerifLeft = Constants.DICTIONARY_VERIF_NUMBER
    private var possibleWords = arrayListOf<PossibleWords>()
    private lateinit var possibleWordsDialog: Dialog
    private lateinit var possibleWordsAdapter: PossibleWordsAdapter
    val user = Users.currentUser
    private var serverUrl = Environment.serverUrl

    private lateinit var skipTurnService: SkipTurnService
    private var skipTurnBound: Boolean = false
    private lateinit var placeService: PlaceService
    private var placeBound: Boolean = false

    private var client = HttpClient() {
        install(ContentNegotiation) {}
    }
    private lateinit var binding: FragmentFeaturesBinding
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + job

    private val connection = object: ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            if(service is SkipTurnService.LocalBinder) {
                skipTurnService = service.getService()
                skipTurnBound = true
            } else if (service is PlaceService.LocalBinder) {
                placeService = service.getService()
                placeBound = true
            }
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            skipTurnBound = false
            placeBound = false
        }
    }

    override fun onStop() {
        super.onStop()
        skipTurnBound = false
        placeBound = false
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

        Intent(requireContext(), SkipTurnService::class.java).also { intent ->
            requireContext().bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
        Intent(requireContext(), PlaceService::class.java).also { intent ->
            requireContext().bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }
        setupDictionaryVerif()
        setupBestPlacements()
        setUpPossibleWordsDialog()
        receiveBestPlacements()
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

    private fun setUpPossibleWordsDialog() {
        possibleWordsDialog = Dialog(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
        possibleWordsDialog.setContentView(R.layout.possible_words_dialog)

        val possibleWordsView = possibleWordsDialog.findViewById<RecyclerView>(R.id.possible_words)
        possibleWordsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        possibleWordsAdapter = PossibleWordsAdapter(possibleWords)
        possibleWordsView.adapter = possibleWordsAdapter

        possibleWordsAdapter.onWordClick = { position ->
            if(Players.currentPlayer.getTurn()) {
                placeService.placeBestWord(possibleWords[position], requireActivity().findViewById(R.id.board))
                skipTurnService.switchTimer()
            }
            Timer().schedule(timerTask {
                possibleWordsDialog.dismiss()
            }, 200)
        }

        val dismissButton = possibleWordsDialog.findViewById<Button>(R.id.dismiss_dialog_button)
        dismissButton.setOnClickListener {
            possibleWordsDialog.dismiss()
        }
    }

    private fun setupBestPlacements() {
        binding.player = Players.getCurrent()
        binding.bestPlacementsButton.setOnClickListener {
            if(Users.currentUser.xpPoints < Constants.BEST_PLACEMENTS_PRICE) {
                Toast.makeText(requireContext(), "Vous n'avez pas assez de points XP", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            SocketHandler.socket.emit("sendBest", CurrentRoom.myRoom.id, Players.currentPlayer.name)
            Users.currentUser.xpPoints -= Constants.BEST_PLACEMENTS_PRICE
        }
    }

    private fun receiveBestPlacements() {
        SocketHandler.socket.on("receiveBest") { response ->
            possibleWords = jacksonObjectMapper().readValue(response[0] as String, object: TypeReference<ArrayList<PossibleWords>>() {})
            activity?.runOnUiThread {
                possibleWordsAdapter.updateData(possibleWords)
                possibleWordsDialog.show()
            }
        }
    }

    private suspend fun isWordInDictionary(word: String): Boolean {
        var response: HttpResponse?
        try{
            response = client.get("$serverUrl/api/game/dictionaryVerif/" + word + "/" + CurrentRoom.myRoom.gameSettings.dictionary) {}
        } catch(e: Exception) {
            response = null
        }
        return response?.status == HttpStatusCode.OK
    }
}
