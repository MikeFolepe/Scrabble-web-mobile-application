package com.example.scrabbleprototype.activities

import android.animation.ArgbEvaluator
import android.animation.ValueAnimator
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.widget.Button
import android.widget.TextView
import androidx.cardview.widget.CardView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.graphics.ColorUtils
import com.example.scrabbleprototype.R
import com.fasterxml.jackson.annotation.JsonTypeInfo.Id

class PrivateGamePwd : AppCompatActivity() {

    private var popupTitle = ""
    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        overridePendingTransition(0, 0)
        setContentView(R.layout.private_game_pwd)

        val bundle = intent.extras
        popupTitle = bundle?.getString("popuptitle", "Title") ?: ""

        findViewById<TextView>(R.id.popup_window_title).text = popupTitle
        val alpha = 100 //between 0-255
        val alphaColor = ColorUtils.setAlphaComponent(Color.parseColor("#000000"), alpha)
        val colorAnimation = ValueAnimator.ofObject(ArgbEvaluator(), Color.TRANSPARENT, alphaColor)
        colorAnimation.duration = 500 // milliseconds
        colorAnimation.addUpdateListener { animator ->
            findViewById<ConstraintLayout>(R.id.popup_window_background).setBackgroundColor(animator.animatedValue as Int)
        }
        colorAnimation.start()

        findViewById<CardView>(R.id.popup_window_view_with_border).alpha = 0f
        findViewById<CardView>(R.id.popup_window_view_with_border).animate().alpha(1f).setDuration(500).setInterpolator(
            DecelerateInterpolator()
        ).start()
    }
}
