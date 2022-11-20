package com.example.scrabbleprototype.activities

import android.animation.ArgbEvaluator
import android.animation.ValueAnimator
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.animation.DecelerateInterpolator
import android.widget.TextView
import androidx.cardview.widget.CardView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.graphics.ColorUtils
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.User
import com.example.scrabbleprototype.objects.ThemeManager
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

class PrivateGamePwd : AppCompatActivity() {

    private var popupTitle = ""
    private val socket = SocketHandler.getPlayerSocket()
    private val mapper = jacksonObjectMapper()

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)
        overridePendingTransition(0, 0)
        setContentView(R.layout.player_request_game)

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

        receiveNewRequest()
    }
    private fun receiveNewRequest() {
        socket.on("newRequest") {response ->
            val newPlayer = mapper.readValue(response[0].toString(), User::class.java)
            Log.d("request response" , newPlayer.toString())
            findViewById<TextView>(R.id.popup_window_text).text = newPlayer.pseudonym + "souhaite rejoindre la partie"
        }
    }
}
