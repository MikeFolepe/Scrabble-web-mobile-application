package com.example.scrabbleprototype.activities.menus.settings

import android.Manifest
import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.ContextThemeWrapper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.toBitmap
import androidx.fragment.app.activityViewModels
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.activities.RegisterActivity
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Themes
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.PreferenceViewModel
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.utils.io.core.*
import io.socket.engineio.parser.Base64
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.io.ByteArrayOutputStream
import java.util.*
import kotlin.concurrent.timerTask
import kotlin.coroutines.CoroutineContext

class SettingsFragment : Fragment(), CoroutineScope {

    private val user = Users
    lateinit var client: HttpClient
    private val mapper = jacksonObjectMapper()
    private val userPrefences = Users.userPreferences
    val avatarSrcImages = arrayListOf(R.drawable.blonde_girl, R.drawable.blonde_guy, R.drawable.brunette_girl, R.drawable.doggo, R.drawable.earrings_girl, R.drawable.ginger_girl, R.drawable.hat_girl, R.drawable.music_guy, R.drawable.mustache_guy, R.drawable.orange_guy, R.drawable.t_l_chargement)
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    private lateinit var boardItemsDialog: Dialog
    private lateinit var chatItemsDialog: Dialog
    private var isAppThemeSpinnerInit = false

    private val preferenceViewModel: PreferenceViewModel by activityViewModels()
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
        client = HttpClient() {
            install(ContentNegotiation) {
                json()
            }
        }
        setupUserInfos()
        setupAppThemes()
        setupBoardItems()
        setupChatItems()
        setupLanguages()
        setupSaveButton()
        launch {
            setupChangeAvatarButtons()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }

    override fun onResume() {
        super.onResume()
        binding.profilePseudonym.setText(user.currentUser.pseudonym)
        binding.profileEmail.setText(user.currentUser.email)
    }

    private fun setupUserInfos() {
        binding.profilePseudonym.setText(user.currentUser.pseudonym)
        binding.profileEmail.setText(user.currentUser.email)
        binding.avatar.setImageBitmap(user.avatarBmp)
    }

    private suspend fun setupChangeAvatarButtons() {
        binding.editAvatarBtn.setOnClickListener {
            var avatarDialog = Dialog(this.requireContext())
            avatarDialog.setContentView(R.layout.avatar_choice)
            val recycler = avatarDialog.findViewById<RecyclerView>(R.id.avatar_image_list)
            recycler.setHasFixedSize(true)
            recycler.layoutManager = GridLayoutManager(this.requireContext(), 3)
            val avatarListAdapter = AvatarAdapter(avatarSrcImages)
            recycler.adapter = avatarListAdapter
            val addAvatarId = resources.getIdentifier("t_l_chargement", "drawable", this.requireContext().packageName)
            avatarDialog.show()
            avatarListAdapter.onClickAvatar = { position ->
                binding.avatar.setImageResource(avatarSrcImages[position])

                //convert to base64 to coord with heavy client
                encodeImageToBase64(binding.avatar.drawable.toBitmap())
                avatarDialog.hide()
                Log.d("avatarpath", avatarSrcImages[position].toString())
                if(addAvatarId == avatarSrcImages[position]) {
                    if(checkAndRequestPermissions()) {
                        takeImageFromCamera()

                    }
                }

            }
        }
        val response = changeAvatarInDb(user.currentUser)
        if(response != null) {
            var receivedUser =  mapper.readValue(response.body() as String, User::class.java)
            user.currentUser = receivedUser
        }
        }
    fun encodeImageToBase64(bmp: Bitmap) {
        var baos = ByteArrayOutputStream()
        bmp.compress(Bitmap.CompressFormat.JPEG, 100, baos)
        var avatarByte = baos.toByteArray()
        var encodeAvatar = Base64.encodeToString(avatarByte, Base64.NO_WRAP)
        user.currentUser.avatar = "data:image/jpeg;base64," + encodeAvatar
    }

    private fun takeImageFromCamera(){
        val takePicture = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        resultLauncher.launch(takePicture)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>,
                                            grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            1 -> {
                if (grantResults.isNotEmpty() && grantResults[0] ==
                    PackageManager.PERMISSION_GRANTED) {
                    if ((ContextCompat.checkSelfPermission(this.requireContext(),
                            Manifest.permission.CAMERA) ===
                            PackageManager.PERMISSION_GRANTED)) {
                        Toast.makeText(this.requireContext(), "Permission Granted", Toast.LENGTH_SHORT).show()
                        takeImageFromCamera()
                    }
                } else {
                    Toast.makeText(this.requireContext(), "Permission Denied", Toast.LENGTH_SHORT).show()
                }
                return
            }
        }
    }

    private fun checkAndRequestPermissions(): Boolean {
        if (Build.VERSION.SDK_INT >= 23) {
            val cameraPermission =
                ActivityCompat.checkSelfPermission(this.requireContext(), Manifest.permission.CAMERA)
            if (cameraPermission == PackageManager.PERMISSION_DENIED) {
                ActivityCompat.requestPermissions(
                    this.requireActivity(),
                    arrayOf(Manifest.permission.CAMERA),
                    20
                )
                return false
            }
        }
        return true
    }

    var resultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            val bundle = data?.extras
            val bitmapImage = bundle?.get("data") as Bitmap
            binding.avatar.setImageBitmap(bitmapImage)
            user.avatarBmp = bitmapImage
            encodeImageToBase64(bitmapImage)
            Log.d("nouveau", bitmapImage.toString())
        }
    }

    suspend fun changeAvatarInDb(currentUser : User ): HttpResponse? {
        var response: HttpResponse?
        try{
            response = client.post(resources.getString(R.string.http) + currentUser.ipAddress + "/api/user/modifyAvatar" + currentUser.pseudonym + currentUser.avatar) {
                contentType(ContentType.Application.Json)
                setBody(currentUser)
            }
        } catch(e: Exception) {
            response = null
        }
        return response
    }

    private fun setupAppThemes() {
        isAppThemeSpinnerInit = false
        val appThemeSpinner = binding.appThemeSpinner
        appThemeSpinner.adapter = AppThemeAdapter(this.requireContext(), R.layout.app_theme_spinner_item, Themes.appThemes)

        appThemeSpinner.setSelection(Themes.appThemes.indexOf(userPrefences.appThemeSelected))
        appThemeSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                if(userPrefences.appThemeSelected == Themes.appThemes[position] || !isAppThemeSpinnerInit) {
                    isAppThemeSpinnerInit = true
                    return
                }
                userPrefences.appThemeSelected = Themes.appThemes[position]
                preferenceViewModel.saveAppTheme()

                ThemeManager.changeToTheme(position)
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
            preferenceViewModel.saveCurrentBoard()
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
            preferenceViewModel.saveCurrentChat()
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

        languageSpinner.setSelection(userPrefences.language.ordinal)
        languageSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                if(userPrefences.language.name == Language.values()[position].name) return
                userPrefences.language = Language.values()[position]
                preferenceViewModel.saveLanguage()
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun setupSaveButton() {
        binding.saveEditsBtn.setOnClickListener {
            user.currentUser.pseudonym = binding.profilePseudonym.text.toString()
            user.currentUser.email = binding.profileEmail.text.toString()
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
}
