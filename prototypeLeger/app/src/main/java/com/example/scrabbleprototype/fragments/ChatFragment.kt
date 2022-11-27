package com.example.scrabbleprototype.fragments

import android.content.Context
import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AbsListView
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ListView
import androidx.fragment.app.Fragment
import com.example.scrabbleprototype.model.ChatAdapter
import com.example.scrabbleprototype.model.ChatRoomMessage
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject


class ChatFragment: Fragment() {

    val messages = mutableListOf<ChatRoomMessage>()
    val currentUser = Users.currentUser
    var socket = SocketHandler.getPlayerSocket()
    lateinit var activityContext: Context

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        return inflaterWithTheme.inflate(com.example.scrabbleprototype.R.layout.fragment_chat, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        socket.on("receiveRoomMessage"){ response ->
            val mapper = jacksonObjectMapper()
            val message = mapper.readValue(response[0].toString(), ChatRoomMessage::class.java)
            addMessage(message, view)
        }
        socket.on("getMessages") { response ->
            val messageArray: JSONArray = response[0] as JSONArray
            for(i in 0 until messageArray.length()) {
                addMessage(Json.decodeFromString(ChatRoomMessage.serializer(), messageArray.get(i).toString()), view)
            }
        }
        setupChatBox(view)
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }

    private fun setupChatBox(view: View) {
        val messagesList = view.findViewById<ListView>(com.example.scrabbleprototype.R.id.chat_box)
        val chatAdapter = ChatAdapter(activityContext, com.example.scrabbleprototype.R.layout.chat_message_style, messages)
        messagesList.adapter = chatAdapter
        messagesList.transcriptMode = AbsListView.TRANSCRIPT_MODE_ALWAYS_SCROLL

        val sendButton = view.findViewById<ImageButton>(com.example.scrabbleprototype.R.id.send_button)
        sendButton.setOnClickListener{
            sendMessage(view)
        }
        val messageInput = view.findViewById<EditText>(com.example.scrabbleprototype.R.id.message_input)
        messageInput.setOnKeyListener(View.OnKeyListener {v, keyCode, event ->
            if(keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                sendMessage(view)
                return@OnKeyListener true
            }
            false
        })
        getOldMessages()
    }

    private fun sendMessage(view: View) {
        val messageInput = view.findViewById<EditText>(com.example.scrabbleprototype.R.id.message_input)
        val message = ChatRoomMessage(messageInput.text.toString(), "", currentUser.pseudonym)

        if(validateMessage(messageInput.text.toString())) {
            socket.emit("sendRoomMessage", JSONObject(Json.encodeToString(message)), CurrentRoom.myRoom.id)
            messageInput.setText("")
        } else messageInput.error = "Le message ne peut pas être vide"
    }

    private fun validateMessage(message: String): Boolean {
        return message.isNotBlank()
    }

    private fun addMessage(message: ChatRoomMessage, view: View) {
        val messagesList = view.findViewById<ListView>(com.example.scrabbleprototype.R.id.chat_box)
        messages.add(message)

        activity?.runOnUiThread {
            val adapter = messagesList.adapter as ChatAdapter
            adapter.notifyDataSetChanged()
            // If the user see the last message -> scroll down
            if(messagesList.lastVisiblePosition + 2 >= messagesList.adapter.count) messagesList.setSelection(messagesList.adapter.count - 1)
        }
    }

    fun getOldMessages() {
        socket.emit("getMessages")
    }
}
