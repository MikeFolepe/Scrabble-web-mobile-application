package com.example.scrabbleprototype.fragments

import android.content.Context
import android.os.Bundle
import android.view.*
import androidx.fragment.app.Fragment
import android.widget.*
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.ChatAdapter
import com.example.scrabbleprototype.model.Message
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject


class ChatFragment : Fragment() {

    val messages = mutableListOf<Message>()
    val currentUser = Users.currentUser
    var chatSocket = SocketHandler.getPlayerSocket()
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
        return inflaterWithTheme.inflate(R.layout.fragment_chat, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        chatSocket.on("roomMessage"){ response ->
            val message = Json.decodeFromString(Message.serializer(), response[0] as String)
            addMessage(message, view)
        }
        chatSocket.on("getMessages") { response ->
            val messageArray: JSONArray = response[0] as JSONArray
            for(i in 0 until messageArray.length()) {
                addMessage(Json.decodeFromString(Message.serializer(), messageArray.get(i).toString()), view)
            }
        }
        setupChatBox(view)
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }

    private fun setupChatBox(view: View) {
        val messagesList = view.findViewById<ListView>(R.id.chat_box)
        val chatAdapter = ChatAdapter(activityContext, R.layout.chat_message_style, messages)
        messagesList.adapter = chatAdapter
        messagesList.transcriptMode = AbsListView.TRANSCRIPT_MODE_ALWAYS_SCROLL

        val sendButton = view.findViewById<ImageButton>(R.id.send_button)
        sendButton.setOnClickListener{
            sendMessage(view)
        }
        val messageInput = view.findViewById<EditText>(R.id.message_input)
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
        val messageInput = view.findViewById<EditText>(R.id.message_input)
        val message = Message(messageInput.text.toString(), currentUser.pseudonym)

        if(validateMessage(messageInput.text.toString())) {
            chatSocket.emit("roomMessage", JSONObject(Json.encodeToString(message)))
            messageInput.setText("")
        } else messageInput.error = "Le message ne peut pas être vide"
    }

    private fun validateMessage(message: String): Boolean {
        return message.isNotBlank()
    }

    private fun addMessage(message: Message, view: View) {
        val messagesList = view.findViewById<ListView>(R.id.chat_box)
        messages.add(message)

        activity?.runOnUiThread {
            val adapter = messagesList.adapter as ChatAdapter
            adapter.notifyDataSetChanged()
            // If the user see the last message -> scroll down
            if(messagesList.lastVisiblePosition + 2 >= messagesList.adapter.count) messagesList.setSelection(messagesList.adapter.count - 1)
        }
    }

    fun getOldMessages() {
        chatSocket.emit("getMessages")
    }
}
