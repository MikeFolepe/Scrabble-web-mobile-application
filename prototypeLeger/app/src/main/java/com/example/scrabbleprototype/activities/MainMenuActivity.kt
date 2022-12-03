package com.example.scrabbleprototype.activities

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.TaskStackBuilder
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.*
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.PopupWindow
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.Observer
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.ActivityMainMenuBinding
import com.example.scrabbleprototype.fragments.ChannelButtonsFragment
import com.example.scrabbleprototype.model.Notification
import com.example.scrabbleprototype.model.NotificationAdapter
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.MyLanguage
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.InvitationViewModel
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.google.android.material.navigation.NavigationView
import java.util.*

class MainMenuActivity : AppCompatActivity() {

    private lateinit var notifAdapter: NotificationAdapter

    private val invitationViewModel: InvitationViewModel by viewModels()
    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainMenuBinding

    private lateinit var notifManager: NotificationManagerCompat

    val CHANNEL_ID = "channelID"
    val CHANNEL_NAME = "channelName"
    val NOTIF_ID = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        val config = resources.configuration
        val lang = MyLanguage.getLanguage()
        Log.d("lang", lang)
        val locale = Locale(lang)
        Locale.setDefault(locale)
        config.setLocale(locale)
        createConfigurationContext(config)
        resources.updateConfiguration(config, resources.displayMetrics)
        //this.applicationContext.resources.updateConfiguration(config, null)

        super.onCreate(savedInstanceState)

        invitationViewModel.updateNotifications()
        val notifObserver = Observer<Boolean> { areNotifsInit ->
            if(areNotifsInit) setupNotifications()
        }
        invitationViewModel.areNotifsInit.observe(this, notifObserver)
        setupPushNotif()
        setupDrawer()
        receiveNotification()
        removeNotification()

        if(savedInstanceState == null) {
            setupFragments()
        }
    }

    private fun setupFragments() {
        val fragmentTransaction = supportFragmentManager.beginTransaction()
        fragmentTransaction.add(R.id.channel_buttons, ChannelButtonsFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main_menu)
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }

    fun setupPushNotif() {
        createNotifChannel()
    }

    private fun createNotifChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT).apply {
                lightColor = Color.BLUE
                enableLights(true)
            }
            val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun setupDrawer() {
        val layoutWithTheme = ThemeManager.setFragmentTheme(layoutInflater, this)
        binding = ActivityMainMenuBinding.inflate(layoutWithTheme)
        setContentView(binding.root)
        setupAvatar()

        val notificationButton = binding.appBarMainMenu.notificationButton
        val notificationDot = binding.appBarMainMenu.newNotificationDot
        notificationDot.visibility = View.VISIBLE
        notificationButton.setOnClickListener {
            showNotifications(setupNotifications())
        }

        setSupportActionBar(binding.appBarMainMenu.toolbar)


        val drawerLayout: DrawerLayout = binding.drawerLayout
        val navView: NavigationView = binding.navView
        val navController = findNavController(R.id.nav_host_fragment_content_main_menu)
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.nav_home, R.id.nav_profile, R.id.nav_settings, R.id.nav_stats, R.id.nav_store
            ), drawerLayout
        )
        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)
    }

    private fun setupAvatar() {
        val avatar = binding.appBarMainMenu.avatar
        avatar.setImageBitmap(Users.currentUser.getAvatarBitmap())
        avatar.setOnClickListener {
            val popupLogout = PopupMenu(this, avatar)
            popupLogout.menuInflater.inflate(R.menu.main_menu, popupLogout.menu)
            popupLogout.setOnMenuItemClickListener {
                Toast.makeText(this, "Déconnexion", Toast.LENGTH_LONG).show()
                return@setOnMenuItemClickListener true
            }
            popupLogout.show()
        }
    }

    private fun setupNotifications(): PopupWindow {
        val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        val inflaterWithTheme = inflater.cloneInContext(ContextThemeWrapper(this, ThemeManager.getTheme()))
        val view = inflaterWithTheme.inflate(R.layout.notification_popup, null)

        val notificationsView = view.findViewById<RecyclerView>(R.id.notifications)
        notificationsView.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        notifAdapter = NotificationAdapter(Users.currentUser.notifications)
        notificationsView.adapter = notifAdapter

        notifAdapter.onNotifClick = { position ->
            if(Users.currentUser.notifications[position].type == 0) {
                val navController = findNavController(R.id.nav_host_fragment_content_main_menu)
                navController.popBackStack()
                navController.navigate(R.id.nav_profile)
            }
            Toast.makeText(this, "Click on notif # " + position.toString(), Toast.LENGTH_LONG).show()
        }
        return PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    private fun showNotifications(popup: PopupWindow) {
        popup.isOutsideTouchable = true
        popup.isFocusable= true
        popup.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        popup.showAsDropDown(binding.appBarMainMenu.notificationButton, 0, 20)
    }

    private fun receiveNotification() {
        SocketHandler.socket.on("receiveNotification") { response ->
            val newNotif = jacksonObjectMapper().readValue(response[0].toString(), Notification::class.java)
            Users.currentUser.notifications.add(newNotif)
            runOnUiThread {
                notifAdapter.updateData(Users.currentUser.notifications)
                createNotifChannel()
                notifManager = NotificationManagerCompat.from(this)
                val intent= Intent(this, MainMenuActivity::class.java)
                val pendingIntent = TaskStackBuilder.create(this).run {
                    addNextIntentWithParentStack(intent)
                    getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT)
                }
                val notif = NotificationCompat.Builder(this,CHANNEL_ID)
                    .setContentTitle("Nouvelle Notification de l'app Scrabble")
                    .setContentText("Vous avez une nouvelle invitation d'ami en attente")
                    .setSmallIcon(R.drawable.ic_baseline_notifications_24)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setContentIntent(pendingIntent)
                    .build()
                notifManager.notify(NOTIF_ID, notif)
            }
        }
    }

    private fun removeNotification() {
        SocketHandler.socket.on("removeFriendNotification") { response ->
            val senderPseudonym = response[0] as String
            Users.currentUser.notifications.removeAll { it.sender == senderPseudonym }
            runOnUiThread { notifAdapter.updateData(Users.currentUser.notifications) }
        }
    }
}
