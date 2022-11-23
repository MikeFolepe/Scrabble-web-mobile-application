package com.example.scrabbleprototype.activities.menus.settings

import android.app.Dialog
import android.content.res.Resources.Theme
import android.os.Bundle
import android.text.Editable
import android.util.Log
import android.view.ContextThemeWrapper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Themes
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.PlacementViewModel
import com.example.scrabbleprototype.viewModel.ProfilViewModel
import java.util.*
import kotlin.concurrent.timerTask

class SettingsFragment : Fragment() {

    private val user = Users.currentUser
    private val userPrefences = Users.userPreferences

    private lateinit var boardItemsDialog: Dialog
    private lateinit var chatItemsDialog: Dialog
    private var isAppThemeSpinnerInit = false

    private val profilViewModel: ProfilViewModel by activityViewModels()
    private lateinit var binding: FragmentSettingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentSettingsBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupUserInfos()
        setupAppThemes()
        setupBoardItems()
        setupChatItems()
        setupLanguages()
        setupSaveButton()
    }

    override fun onResume() {
        super.onResume()
        binding.profilePseudonym.setText(user.pseudonym)
        binding.profileEmail.setText(user.email)
    }

    private fun setupUserInfos() {
        binding.profilePseudonym.setText(user.pseudonym)
        binding.profileEmail.setText(user.email)
    }

    private fun setupAppThemes() {
        isAppThemeSpinnerInit = false
        val appThemeSpinner = binding.appThemeSpinner
        appThemeSpinner.adapter = AppThemeAdapter(this.requireContext(), R.layout.app_theme_spinner_item, Themes.appThemes)

        appThemeSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                if(userPrefences.appThemeSelected == Themes.appThemes[position] || !isAppThemeSpinnerInit) {
                    isAppThemeSpinnerInit = true
                    return
                }
                userPrefences.appThemeSelected = Themes.appThemes[position]

                ThemeManager.changeToTheme(position, activity)
                recreateFragment()
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun setupBoardItems() {
        setupBoardItemsDialog()
        val boardItemSelected = binding.boardTheme
        val editBoardItemBtn = binding.editBoardTheme

        boardItemSelected.text = userPrefences.boardItemSelected.name
        editBoardItemBtn.setOnClickListener {
            boardItemsDialog.show()
        }
    }

    private fun setupBoardItemsDialog() {
        boardItemsDialog = Dialog(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
        boardItemsDialog.setContentView(R.layout.user_theme_dialog)

        boardItemsDialog.findViewById<TextView>(R.id.dialog_title).text = getString(R.string.themes_dialog_title, "plateau de jeu")

        val boardItemsView = boardItemsDialog.findViewById<RecyclerView>(R.id.themes)
        val horizontalLayoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.HORIZONTAL, false)
        boardItemsView.layoutManager = horizontalLayoutManager
        val boardItemsAdapter = ThemeAdapter(userPrefences.boardItems)
        boardItemsView.adapter = boardItemsAdapter

        boardItemsAdapter.onThemeClick = { position ->
            userPrefences.boardItemSelected = userPrefences.boardItems[position]
            binding.boardTheme.text = userPrefences.boardItemSelected.name
            ThemeManager.currentBoardTheme = userPrefences.boardItemSelected.name
            saveCurrentBoard()
            Timer().schedule(timerTask {
                boardItemsDialog.dismiss()
            }, 200)
        }

        val dismissButton = boardItemsDialog.findViewById<Button>(R.id.dismiss_dialog_button)
        dismissButton.setOnClickListener {
            boardItemsDialog.dismiss()
        }
    }

    private fun setupChatItems() {
        setupChatItemsDialog()
        val chatItemSelected = binding.chatTheme
        val editChatItemBtn = binding.editChatTheme

        chatItemSelected.text = userPrefences.chatItemSelected.name
        editChatItemBtn.setOnClickListener {
            chatItemsDialog.show()
        }

    }

    private fun setupChatItemsDialog() {
        chatItemsDialog = Dialog(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
        chatItemsDialog.setContentView(R.layout.user_theme_dialog)

        chatItemsDialog.findViewById<TextView>(R.id.dialog_title).text = getString(R.string.themes_dialog_title, "boite de communication")

        val chatItemsView = chatItemsDialog.findViewById<RecyclerView>(R.id.themes)
        val horizontalLayoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.HORIZONTAL, false)
        chatItemsView.layoutManager = horizontalLayoutManager
        val chatItemsAdapter = ThemeAdapter(userPrefences.chatItems)
        chatItemsView.adapter = chatItemsAdapter

        chatItemsAdapter.onThemeClick = { position ->
            userPrefences.chatItemSelected = userPrefences.chatItems[position]
            binding.chatTheme.text = userPrefences.chatItemSelected.name
            ThemeManager.currentChatTheme = userPrefences.chatItemSelected.name
            Timer().schedule(timerTask {
                chatItemsDialog.dismiss()
            }, 200)
        }

        val dismissButton = chatItemsDialog.findViewById<Button>(R.id.dismiss_dialog_button)
        dismissButton.setOnClickListener {
            chatItemsDialog.dismiss()
        }
    }

    private fun setupLanguages() {
        val languageSpinner = binding.languageSpinner
        languageSpinner.adapter = ArrayAdapter(this.requireContext(), R.layout.app_theme_spinner_item, Language.values())

        languageSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long
            ) { userPrefences.language = Language.values()[position] }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun setupSaveButton() {
        binding.saveEditsBtn.setOnClickListener {
            user.pseudonym = binding.profilePseudonym.text.toString()
            user.email = binding.profileEmail.text.toString()
            Toast.makeText(requireContext(), "Les changements ont été sauvegardés", Toast.LENGTH_LONG).show()
        }
    }

    private fun recreateFragment() {
        val supportFragmentManager = this@SettingsFragment.fragmentManager ?: return
        val fragment = supportFragmentManager.findFragmentById(R.id.nav_host_fragment_content_main_menu) ?: return
        supportFragmentManager.beginTransaction().detach(fragment).commit()
        supportFragmentManager.executePendingTransactions()
        supportFragmentManager.beginTransaction().attach(fragment).commit()
        activity?.recreate()
    }

    private fun saveCurrentBoard() {
        profilViewModel.saveCurrentBoard(Users.userPreferences.boardItemSelected.name)
    }
}
