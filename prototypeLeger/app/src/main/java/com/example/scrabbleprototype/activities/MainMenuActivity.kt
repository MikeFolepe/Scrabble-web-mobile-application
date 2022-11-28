package com.example.scrabbleprototype.activities

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.AttributeSet
import android.util.Log
import android.view.*
import android.widget.Button
import android.widget.FrameLayout
import android.widget.PopupWindow
import android.widget.Toast
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.navigation.NavigationView
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import androidx.drawerlayout.widget.DrawerLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.navigation.NavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.ActivityMainMenuBinding
import com.example.scrabbleprototype.model.NotifType
import com.example.scrabbleprototype.model.Notification
import com.example.scrabbleprototype.model.NotificationAdapter
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

class MainMenuActivity : AppCompatActivity() {

    private lateinit var notifAdapter: NotificationAdapter

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainMenuBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)

        Users.currentUser.notifications.add(Notification(NotifType.Friend, "hey", "notification d'invitation d'ami de test"))
        Users.currentUser.notifications.add(Notification(NotifType.Game, "hey", "notification d'invitation à une partie de test"))
        Users.currentUser.notifications.add(Notification(NotifType.Message, "hey", "notification d'un nouveau message dans un canal de discussion de test"))

        setupDrawer()
        setupNotifications()
        receiveNotification()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main_menu)
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }

    private fun setupDrawer() {
        val layoutWithTheme = ThemeManager.setFragmentTheme(layoutInflater, this)
        binding = ActivityMainMenuBinding.inflate(layoutWithTheme)
        setContentView(binding.root)

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

    private fun setupNotifications(): PopupWindow {
        val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        val inflaterWithTheme = inflater.cloneInContext(ContextThemeWrapper(this, ThemeManager.getTheme()))
        val view = inflaterWithTheme.inflate(R.layout.notification_popup, null)

        val notificationsView = view.findViewById<RecyclerView>(R.id.notifications)
        notificationsView.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        notifAdapter = NotificationAdapter(Users.currentUser.notifications)
        notificationsView.adapter = notifAdapter

        notifAdapter.onNotifClick = { position ->
            if(Users.currentUser.notifications[position].type == NotifType.Friend) {
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
            runOnUiThread { notifAdapter.updateData(Users.currentUser.notifications) }
        }
    }
}
