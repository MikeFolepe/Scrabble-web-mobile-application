package com.example.scrabbleprototype.objects

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.Log
import android.view.ContextThemeWrapper
import android.view.LayoutInflater
import androidx.fragment.app.FragmentManager
import com.example.scrabbleprototype.R

object ThemeManager {
    private var currentTheme: Int = 0
    val THEME_DEFAULT = 0
    val THEME_DARK = 1
    val THEME_BLUE = 2
    val THEME_ORANGE = 3

    fun changeToTheme(theme: Int) {
        currentTheme = theme
        //RELOAD FRAGMENT?
    }

    fun setActivityTheme(activity: Activity) {
        when(currentTheme) {
            0 -> {
                activity.setTheme(R.style.Theme_ScrabblePrototype)
            }
            1 -> {
                activity.setTheme(R.style.Theme_ScrabblePrototype_Dark)
            }
            2 -> {
                activity.setTheme(R.style.Theme_ScrabblePrototype_Blue)
            }
            3 -> {
                activity.setTheme(R.style.Theme_ScrabblePrototype_Orange)
            }
        }
    }

    fun setFragmentTheme(layoutInflater: LayoutInflater, fragmentContext: Context): LayoutInflater {
        when(currentTheme) {
            0 -> {
                return layoutInflater.cloneInContext(ContextThemeWrapper(fragmentContext, R.style.Theme_ScrabblePrototype))
            }
            1 -> {
                Log.d("changetheme", "dark")
                return layoutInflater.cloneInContext(ContextThemeWrapper(fragmentContext, R.style.Theme_ScrabblePrototype_Dark))
            }
            2 -> {
                return layoutInflater.cloneInContext(ContextThemeWrapper(fragmentContext, R.style.Theme_ScrabblePrototype_Blue))
            }
            3 -> {
                return layoutInflater.cloneInContext(ContextThemeWrapper(fragmentContext, R.style.Theme_ScrabblePrototype_Orange))
            }
        }
        return layoutInflater
    }
}
