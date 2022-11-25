package com.example.scrabbleprototype.fragments

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.*
import androidx.fragment.app.Fragment
import android.widget.*
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.ChatAdapter
import com.example.scrabbleprototype.model.ChatRoomMessage
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.*
import com.example.scrabbleprototype.objects.ChatRooms.chatRooms
import com.example.scrabbleprototype.objects.ChatRooms.currentChatRoom
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.util.*
import kotlin.concurrent.timerTask


class ChatRoomFragment: Fragment() {

    val currentUser = Users.currentUser
    private var chatAdapter: ChatAdapter? = null

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
        return inflaterWithTheme.inflate(R.layout.fragment_chat_room, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        if(currentChatRoom != null) setupChatBox(view)
        receiveMessages()
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activityContext = context
    }

    private fun setupChatBox(view: View) {
        Log.d("creating frag", currentChatRoom?.chatRoomName.toString())
        view.findViewById<TextView>(R.id.chat_name).text = currentChatRoom?.chatRoomName

        val messagesList = view.findViewById<ListView>(R.id.chatroom_chatbox)
        chatAdapter = ChatAdapter(activityContext, R.layout.chat_message_style, currentChatRoom!!.messages)
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
    }

    private fun sendMessage(view: View) {
        val messageInput = view.findViewById<EditText>(R.id.message_input)
        val currentIndex = ChatRooms.getCurrentChatRoomIndex()
        if(currentIndex == -1) return

        if(validateMessage(messageInput.text.toString())) {
            socket.emit("newMessage", currentIndex, JSONObject(Json.encodeToString(Users.currentUser)), messageInput.text.toString())
            messageInput.setText("")
        } else messageInput.error = "Le message ne peut pas être vide"
    }

    private fun validateMessage(message: String): Boolean {
        return message.isNotBlank()
    }

    private fun receiveMessages() {
        socket.on("updateChatRooms") { response ->
            Timer().schedule(timerTask {
                currentChatRoom = chatRooms.find { it.chatRoomName == currentChatRoom?.chatRoomName }
                activity?.runOnUiThread {
                    if(currentChatRoom == null || chatAdapter == null) return@runOnUiThread
                    chatAdapter?.updateData(currentChatRoom!!.messages)
                }
            }, 200)
        }
    }
}
