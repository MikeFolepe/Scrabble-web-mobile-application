package com.example.scrabbleprototype.activities

import android.app.ActivityManager
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.fragments.ChannelButtonsFragment
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.google.android.material.snackbar.Snackbar
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject


class JoinGameActivity : AppCompatActivity() {

    var rooms = arrayListOf<Room>()
    val socket = SocketHandler.getPlayerSocket()
    private val mapper = jacksonObjectMapper()
    val currentUser = Users.currentUser
    lateinit var passwordDialog: Dialog

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.setActivityTheme(this)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_join_game)

        receivePlayers()
        receiveMyPlayer()
        currRoom()
        routeToWaitingRoom()
        setupGameList()
        receiveJoinDecision()
        sendObserverToGame()
        previewRoomPlayers()
        // handleDeletedGame()
        handleObservableRoomsAvailability()

        if(savedInstanceState == null) {
            setupFragments()
        }
    }

    private fun setupFragments() {
        val fragmentTransaction = supportFragmentManager.beginTransaction()
        fragmentTransaction.add(R.id.join_game_chatroom_buttons, ChannelButtonsFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    private fun setupGameList() {

        val gameListView = findViewById<RecyclerView>(R.id.available_games_list)
        val verticalLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        gameListView.layoutManager = verticalLayoutManager
        val gameListAdapter = GameListAdapter(rooms)
        gameListView.adapter = gameListAdapter
        gameListAdapter.updateData(rooms)

        gameListAdapter.onJoinGame = { position ->
            if (rooms[position].state == State.Playing && rooms[position].gameSettings.type == RoomType.public.ordinal) {
                Users.currentUser.isObserver = true;
            }
            joinGame(position, Users.currentUser.isObserver)
        }
        gameListAdapter.onPreviewRoom = { position ->
            socket.emit("previewPlayers", rooms[position].id)
        }
        receiveRooms(gameListAdapter)
        handleRoomUnavailability()
    }

    fun displayPlayersInRoom() {
        var playersListDialog = Dialog(this)
        playersListDialog.setContentView(R.layout.preview_players_room)
        val playersWaitingView = playersListDialog.findViewById<RecyclerView>(R.id.players_waiting)
        val verticalLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        playersWaitingView.layoutManager = verticalLayoutManager
        var playersWaitingAdapter = PlayersWaitingAdapter(Players.players)
        playersWaitingView.adapter = playersWaitingAdapter
        playersWaitingAdapter.updateData(Players.players)
        playersListDialog.show()
        val closeButton = playersListDialog.findViewById<Button>(R.id.close_button)
        closeButton.setOnClickListener {
            playersListDialog.hide()
        }
    }

    private fun setupPasswordJoinDialog(currentRoom: Room, isObserver: Boolean) {
        passwordDialog = Dialog(this)
        passwordDialog.setContentView(R.layout.public_game_pwd)
        val validateButton = passwordDialog.findViewById<Button>(R.id.validate_button)

        val backButton = passwordDialog.findViewById<Button>(R.id.back_button)

        backButton.setOnClickListener {
            passwordDialog.dismiss()
        }

        validateButton.setOnClickListener {
            val passwordInput = passwordDialog.findViewById<EditText>(R.id.popup_window_text)
            if (passwordInput.text.toString() == "") return@setOnClickListener;
            if (passwordInput.text.toString() == currentRoom.gameSettings.password) {

                if (isObserver) {
                    socket.emit("newRoomObserver", JSONObject(Json.encodeToString(Users.currentUser)), currentRoom.id)

                } else {
                    socket.emit("newRoomCustomer", Users.currentUser.pseudonym, currentRoom.id, Users.currentUser._id)
                }

            } else {
                Toast.makeText(this, "Mot de passe incorrect", Toast.LENGTH_LONG).show()
            }
            passwordDialog.dismiss()
        }
    }


    private fun joinGame(position: Int, isObserver: Boolean) {
        val currentRoom = rooms[position]
        if(currentRoom.gameSettings.type == RoomType.private.ordinal) {
            socket.emit("sendRequestToCreator", Users.currentUser.pseudonym, currentRoom.id)
            SocketHandler.roomId = rooms[position].id
            return
        }
        if (currentRoom.gameSettings.password == "") {
            if(isObserver){
                Log.d("emitNewObser", "ddde")
                socket.emit("newRoomObserver", JSONObject(Json.encodeToString(Users.currentUser)), rooms[position].id)
                SocketHandler.roomId = rooms[position].id
                return
            }
            socket.emit("newRoomCustomer", Users.currentUser.pseudonym, rooms[position].id, Users.currentUser._id)
            SocketHandler.roomId = rooms[position].id
            return
        }

        setupPasswordJoinDialog(currentRoom,isObserver)

        passwordDialog.show()

    }

    private fun sendObserverToGame() {
        socket.on("ObserverToGameView") { response ->
            Users.currentUser.isObserver = true;
            startActivity(Intent(this, GameActivity::class.java))
        }
    }


    private fun currRoom() {
        socket.on("yourRoom") {response ->
            var myRoom =  mapper.readValue(response[0].toString(), Room::class.java)
            CurrentRoom.myRoom =  myRoom
            SocketHandler.roomId = myRoom.id
        }
    }

    private fun receiveRooms(gameListAdapter: GameListAdapter) {
        socket.once("roomConfiguration"){ response ->
            rooms = mapper.readValue(response[0].toString(), object: TypeReference<ArrayList<Room>>() {})
            runOnUiThread {
                gameListAdapter.updateData(rooms)
            }
        }
        socket.emit("getRoomsConfiguration")
    }

    private fun receiveMyPlayer() {
        socket.on("MyPlayer") { response ->
            Players.currentPlayer = mapper.readValue(response[0].toString(), Player::class.java)
        }
    }

    private fun receivePlayers() {
        socket.once("roomPlayers") { response ->
            Log.d("roomPlayers", "join")
            Players.players = mapper.readValue(response[0].toString(), object: TypeReference<ArrayList<Player>>() {})
        }
    }
    private fun previewRoomPlayers() {
        socket.on("previewRoomPlayers") { response ->
            Players.players = mapper.readValue(response[0].toString(), object: TypeReference<ArrayList<Player>>() {})
            runOnUiThread {
                displayPlayersInRoom()
            }
        }
    }


    private fun receiveJoinDecision() {
        socket.once("receiveJoinDecision") { response ->

            val decision = mapper.readValue(response[0].toString(), Boolean::class.java)
            val roomId = response[1].toString()
            Log.d("roomId" , roomId)
            Log.d("decision" , decision.toString())
            if (decision) {
                socket.emit("newRoomCustomer", currentUser.pseudonym, roomId)
            }
            else {
                Snackbar.make(findViewById<LinearLayout>(R.id.snackbar_text), "Demande rejet??e par le cr??ateur", Snackbar.LENGTH_LONG).show()
            }
        }
    }

   /* private fun handleDeletedGame() {
        socket.on("leaveToHome") {
            runOnUiThread {
                Toast.makeText(this, "Le createur a supprim?? la partie", Toast.LENGTH_LONG).show()
                startActivity(Intent(this, MainMenuActivity::class.java))
            }
        }
    }

    */

    private fun handleRoomUnavailability() {
        socket.on("roomAlreadyToken") {
            runOnUiThread { Toast.makeText(this, "Il est impossible de joindre cette partie", Toast.LENGTH_LONG).show() }
        }
    }

    private fun routeToWaitingRoom() {
        socket.once("goToWaiting") {
            Log.d("routetowaiting", "going")
            startActivity(Intent(this, WaitingRoomActivity::class.java))
        }
    }

    private fun handleObservableRoomsAvailability() {
        socket.on("roomFullObservers") { response ->
            runOnUiThread { Toast.makeText(this, "Il n'y a plus de place pour observer la partie", Toast.LENGTH_LONG).show() }
        }
    }
}
