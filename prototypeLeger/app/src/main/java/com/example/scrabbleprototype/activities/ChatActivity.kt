package com.example.scrabbleprototype.activities

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.ChatAdapter
import com.example.scrabbleprototype.model.Message
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.Users
import com.google.android.material.snackbar.BaseTransientBottomBar
import com.google.android.material.snackbar.Snackbar
import io.socket.client.Socket
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject

class ChatActivity : AppCompatActivity() {

    val messages = mutableListOf<Message>()
    val currentUser = Users.currentUser
    var chatSocket = SocketHandler.getSocket()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        val returnButton = findViewById<TextView>(R.id.return_button)
        returnButton.setOnClickListener {
            SocketHandler.closeConnection()
            startActivity(Intent(this@ChatActivity, ConnectionActivity::class.java))
        }

        findViewById<LinearLayout>(R.id.chat_layout).setOnTouchListener { v, event ->
            when (event?.action) {
                MotionEvent.ACTION_DOWN -> {
                    hideKeyboard()
                }
            }
            v?.onTouchEvent(event) ?: true
        }

        chatSocket.on("roomMessage"){ response ->
            val message = Json.decodeFromString(Message.serializer(), response[0] as String)
            addMessage(message)
        }
        chatSocket.on("getMessages") { response ->
            val messageArray: JSONArray = response[0] as JSONArray
            for(i in 0 until messageArray.length()) {
                addMessage(Json.decodeFromString(Message.serializer(), messageArray.get(i).toString()))
            }
        }
        setupChatBox()
    }

    private fun setupChatBox() {
        val messagesList = findViewById<ListView>(R.id.chat_box)
        val chatAdapter = ChatAdapter(this, R.layout.chat_message_style, messages)
        messagesList.adapter = chatAdapter
        messagesList.transcriptMode = AbsListView.TRANSCRIPT_MODE_ALWAYS_SCROLL

        val sendButton = findViewById<ImageButton>(R.id.send_button)
        sendButton.setOnClickListener{
            sendMessage()
        }
        val messageInput = findViewById<EditText>(R.id.message_input)
        messageInput.setOnKeyListener(View.OnKeyListener {v, keyCode, event ->
            if(keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                sendMessage()
                return@OnKeyListener true
            }
            false
        })
        getOldMessages()
    }

    private fun sendMessage() {
        val messageInput = findViewById<EditText>(R.id.message_input)
        val message = Message(messageInput.text.toString(), currentUser)

        if(validateMessage(messageInput.text.toString())) {
            chatSocket.emit("roomMessage", JSONObject(Json.encodeToString(message)))
            addMessage(message)
            messageInput.setText("")
        } else messageInput.error = "Le message ne peut pas être vide"
    }

    private fun validateMessage(message: String): Boolean {
        return message.isNotBlank()
    }

    private fun addMessage(message: Message) {
        val messagesList = findViewById<ListView>(R.id.chat_box)
        messages.add(message)

        runOnUiThread {
            val adapter = messagesList.adapter as ChatAdapter
            adapter.notifyDataSetChanged()
            // If the user see the last message -> scroll down
            if(messagesList.lastVisiblePosition + 2 >= messagesList.adapter.count) messagesList.setSelection(messagesList.adapter.count - 1)
            // Else send notif of new message and don't scroll down since the use is looking through old messages
            else {
                val newMessageNotif = Snackbar.make(findViewById(android.R.id.content), "Nouveau Message!", BaseTransientBottomBar.LENGTH_LONG)
                newMessageNotif.show()
            }
        }
    }

    fun getOldMessages() {
        chatSocket.emit("getMessages")
    }

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        if(this.currentFocus?.windowToken != null) imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }
}
