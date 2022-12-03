package com.example.scrabbleprototype.objects

import android.app.Activity
import android.app.Application
import android.content.Context
import android.content.Intent
import android.util.Log
import android.view.ContextThemeWrapper
import android.view.LayoutInflater
import androidx.appcompat.app.AppCompatViewInflater
import androidx.appcompat.widget.ThemeUtils
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat.ThemeCompat
import androidx.fragment.app.FragmentManager
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.ThemeAdapter
import com.google.android.material.appbar.AppBarLayout

object ThemeManager {
    private var currentTheme: Int = 0
    var currentBoardTheme: String = "Par défaut"
    var currentChatTheme: String = "Par défaut"

    val THEME_DEFAULT = 0
    val THEME_DARK = 1
    val THEME_BLUE = 2
    val THEME_ORANGE = 3

    val DEFAULT = "Par défaut"
    val GRADIENT = "Gradients animés"
    val TARTAN = "Tartan"
    val GALAXY = "Galaxie"

    fun changeToTheme(theme: Int) {
        currentTheme = theme
    }

    fun setActivityTheme(activity: Activity) {
        activity.setTheme(getTheme())
    }

    fun setFragmentTheme(layoutInflater: LayoutInflater, fragmentContext: Context): LayoutInflater {
        return layoutInflater.cloneInContext(ContextThemeWrapper(fragmentContext, getTheme()))
    }

    fun getTheme(): Int {
        when(currentTheme) {
            THEME_DEFAULT -> return R.style.Theme_ScrabblePrototype
            THEME_DARK -> return R.style.Theme_ScrabblePrototype_Dark
            THEME_BLUE -> return R.style.Theme_ScrabblePrototype_Blue
            THEME_ORANGE -> return R.style.Theme_ScrabblePrototype_Orange
        }
        return R.style.Theme_ScrabblePrototype
    }

    fun getAlertTheme(): Int {
        when(currentTheme) {
            THEME_DEFAULT -> return R.style.Theme_DefaultAlert
            THEME_DARK -> return R.style.Theme_DarkAlert
            THEME_BLUE -> return R.style.Theme_DefaultAlert
            THEME_ORANGE -> return R.style.Theme_DefaultAlert
        }
        return R.style.Theme_DefaultAlert
    }

    fun getBoardTheme(): Int {
        when(currentBoardTheme) {
            DEFAULT -> return R.drawable.board_border
            GRADIENT -> return R.drawable.gradient_animation
            TARTAN -> return R.drawable.tartan
            GALAXY -> return R.drawable.galaxy
        }
        return R.drawable.board_border
    }

    fun getChatTheme(): Int {
        when(currentChatTheme) {
            DEFAULT -> return R.drawable.chatbox_border
            GRADIENT -> return R.drawable.gradient_animation
            GALAXY -> return R.drawable.galaxy
        }
        return R.drawable.chatbox_border
    }
}
