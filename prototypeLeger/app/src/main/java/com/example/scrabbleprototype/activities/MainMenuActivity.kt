package com.example.scrabbleprototype.activities

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.AttributeSet
import android.util.Log
import android.view.Menu
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
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
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.ActivityMainMenuBinding
import com.example.scrabbleprototype.objects.ThemeManager

class MainMenuActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainMenuBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)
        setupDrawer()
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
        notificationButton.setOnClickListener {
            Log.d("Notif", "NOTOTAOWDAW")
            if(notificationDot.visibility == View.GONE) notificationDot.visibility = View.VISIBLE
            else notificationDot.visibility = View.GONE
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
}
