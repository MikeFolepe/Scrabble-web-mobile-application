package com.example.scrabbleprototype.services

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.Board
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.LetterRack
import com.example.scrabbleprototype.objects.Players
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.*
import kotlin.concurrent.timerTask

class PlaceService : Service() {
    var isFirstPlacement: Boolean = true
    private var board = Board.cases
    private var spaceBetweenEachLetter: Int = 1
    private var orientation: Orientation = Orientation.Horizontal
    private var startPosition: Int = 0

    private val socket = SocketHandler.getPlayerSocket()
    private val binder = LocalBinder()

    inner class LocalBinder: Binder() {
        fun getService(): PlaceService = this@PlaceService
    }

    override fun onBind(intent: Intent): IBinder {
        return binder
    }

    fun validatePlacement(placementPositions: IntArray): Boolean {
        startPosition = placementPositions.first()

        return if(isFirstPlacement) {
            (isFirstWordValid(placementPositions) && isWordContinuous(placementPositions))
        } else {
            (isWordContinuous(placementPositions) && isWordTouchingOthers(placementPositions))
        }
    }

    private fun isFirstWordValid(placementPositions: IntArray): Boolean {
        if(placementPositions.size < Constants.MIN_FIRST_WORD_SIZE) return false
        for(position in placementPositions) {
            if(position == Constants.BOARD_CENTER) return true
        }
        return false
    }

    private fun isWordContinuous(placementPositions: IntArray): Boolean {
        // (1) Assurer que le placement est sur une "ligne" selon orientation

        orientation = if(placementPositions.all { (it - startPosition) < 15 } ) Orientation.Horizontal
                      else if(placementPositions.all { (it - startPosition) % 15 == 0 }) Orientation.Vertical
        else return false

        // (2) Assurer que le placement n'a pas de trous
        spaceBetweenEachLetter = 1
        if(orientation == Orientation.Vertical) spaceBetweenEachLetter = 15

        for(i in 0 until placementPositions.size - 1) {
            val spaceBetweenPlacedLetters = placementPositions[i + 1] - placementPositions[i]
            if(spaceBetweenPlacedLetters != spaceBetweenEachLetter) {
                //Check if theres already placed letters in between
                for(j in 1 until spaceBetweenPlacedLetters / spaceBetweenEachLetter) {
                    if(board[placementPositions[i] + spaceBetweenEachLetter * j].value == "") {
                        return false
                    }
                }
            }
        }
        Log.d("placing", "Continuous")
        return true
    }

    private fun getWord(orientation: Orientation): String {
        var wordPlaced = ""
        var currentPosition = startPosition
        spaceBetweenEachLetter = 1
        if(orientation == Orientation.Vertical) spaceBetweenEachLetter = 15

        var nextPosition = currentPosition - spaceBetweenEachLetter
        // Go back to the first letter of the word
        while(nextPosition >= 0 && board[nextPosition].value.isNotEmpty()) {
            currentPosition = nextPosition
            nextPosition -= spaceBetweenEachLetter
        }

        var boardLimit: Int = Constants.BOARD_HEIGHT * spaceBetweenEachLetter
        if(orientation == Orientation.Horizontal) boardLimit = startPosition + (Constants.BOARD_HEIGHT - get2DPosition(currentPosition).y)

        startPosition = currentPosition
        // Form the word
        while(currentPosition < boardLimit && board[currentPosition].value.isNotEmpty()) {
            wordPlaced += board[currentPosition].value
            currentPosition += spaceBetweenEachLetter
        }
        return wordPlaced
    }

    private fun isWordTouchingOthers(placementPosition: IntArray): Boolean {
        var isWordTouching = false
        spaceBetweenEachLetter = 1
        if(orientation == Orientation.Horizontal) spaceBetweenEachLetter = 15

        for(position in placementPosition) {
            if(isBoardFilledAt(position + spaceBetweenEachLetter)) isWordTouching = true
            if(isBoardFilledAt(position - spaceBetweenEachLetter)) isWordTouching = true
            spaceBetweenEachLetter = 1
            if(orientation == Orientation.Vertical) spaceBetweenEachLetter = 15
            if(isBoardFilledAt(position + spaceBetweenEachLetter)) {
                if(!placementPosition.contains(position + spaceBetweenEachLetter)) isWordTouching = true
            }
            if(isBoardFilledAt(position - spaceBetweenEachLetter)) {
                if(!placementPosition.contains(position - spaceBetweenEachLetter)) isWordTouching = true
            }
        }
        Log.d("placing", isWordTouching.toString())
        return isWordTouching
    }

    fun sendPlacement() {
        Log.d("sendPlace", getWord(orientation))
        socket.emit("validatePlacement",
            Json.encodeToString(get2DPosition(startPosition)),
            getWord(orientation).lowercase(),
            Json.encodeToString(orientation.ordinal),
            false,
            false,
            Json.encodeToString(get2DBoard()),
            CurrentRoom.myRoom.id,
            Json.encodeToString(Players.currentPlayer))
    }

    fun placeByOpponent(startPosition: Vec2, orientation: Orientation, word: String, boardView: RecyclerView) {
        isFirstPlacement = false
        var currentPosition = get1DPosition(startPosition.y, startPosition.x)
        var spaceBetweenEachLetter = 1
        if(orientation == Orientation.Vertical) spaceBetweenEachLetter = 15

        for(letter in word) {
            val letterFound = Constants.RESERVE.find { it.value == letter.uppercase() }
                ?: return
            val letterToPlace = Letter(letterFound.value.lowercase(), letterFound.quantity, letterFound.points, false, false)
            letterToPlace.isValidated = true
            board[currentPosition] = letterToPlace
            boardView.adapter?.notifyItemChanged(currentPosition)
            currentPosition += spaceBetweenEachLetter
        }
    }

    fun placeBestWord(placement: PossibleWords, boardView: RecyclerView) {
        LocalBroadcastManager.getInstance(this).sendBroadcast(Intent("handleInvalidPlacement"))

        val startPosition = Vec2(placement.startIndex, placement.line)
        var currentPosition = get1DPosition(startPosition.y, startPosition.x)
        var spaceBetweenEachLetter = 1
        if(placement.orientation == Orientation.Vertical) spaceBetweenEachLetter = 15

        Timer().schedule(timerTask {
            Handler(Looper.getMainLooper()).post {
                for (letter in placement.word) {
                    if (!board[currentPosition].isEmpty()) {
                        currentPosition += spaceBetweenEachLetter
                        continue
                    }
                    // TODO Lettre blanche => index est de -1
                    LetterRack.letters.removeAt(LetterRack.letters.indexOfFirst { it.value == letter.uppercase() })
                    val letterFound = Constants.RESERVE.find { it.value == letter.uppercase() }
                        ?: return@post
                    val letterToPlace = Letter(
                        letterFound.value.lowercase(),
                        letterFound.quantity,
                        letterFound.points,
                        false,
                        false
                    )
                    letterToPlace.isValidated = true
                    board[currentPosition] = letterToPlace

                    boardView.adapter?.notifyItemChanged(currentPosition)
                    currentPosition += spaceBetweenEachLetter
                }
                Players.currentPlayer.letterTable = LetterRack.letters

                socket.emit(
                    "validatePlacement", Json.encodeToString(startPosition),
                    placement.word.lowercase(),
                    Json.encodeToString(placement.orientation.ordinal),
                    false, false,
                    Json.encodeToString(get2DBoard()),
                    CurrentRoom.myRoom.id,
                    Json.encodeToString(Players.currentPlayer)
                )
            }
        }, 200)
    }

    private fun isBoardFilledAt(position: Int): Boolean {
        if(position in 0 until Constants.BOARD_SIZE) return board[position].value.isNotEmpty()
        return false
    }

    private fun get2DPosition(index: Int): Vec2 {
        val x: Int = index % Constants.BOARD_HEIGHT
        val y: Int = (index - index % Constants.BOARD_HEIGHT) / Constants.BOARD_HEIGHT
        return Vec2(x, y)
    }

    fun get1DPosition(x: Int, y: Int): Int {
        return x * Constants.BOARD_HEIGHT + y
    }

    private fun get2DBoard(): Array<Array<String>> {
        val board2D: Array<Array<String>> =
            Array(Constants.BOARD_HEIGHT) { x ->
                Array(Constants.BOARD_HEIGHT) { y ->
                    board[get1DPosition(x, y)].value
                }
            }
        return board2D
    }
}
