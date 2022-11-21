package com.example.scrabbleprototype.fragments

import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentChannelButtonsBinding
import com.example.scrabbleprototype.model.AllChatRoomsAdapter
import com.example.scrabbleprototype.model.ChatRoom
import com.example.scrabbleprototype.model.MyChatRoomsAdapter
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.ChatRooms.chatRooms
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject

class ChannelButtonsFragment : Fragment() {

    private var selectedChatRooms = arrayListOf<String>()

    private var adapter: AllChatRoomsAdapter? = null
    private var myChatRoomsAdapter: MyChatRoomsAdapter? = null
    lateinit var chatsView: RecyclerView
    lateinit var  allChatRoomsDialog: Dialog
    lateinit var  myChatRoomsDialog: Dialog
    private val socket = SocketHandler.socket

    private lateinit var binding: FragmentChannelButtonsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if(savedInstanceState == null) {
            setUpFragments()
        }
        receiveChatRooms()
        receiveNewChatRoom()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentChannelButtonsBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupAllChatRoomsDialog()
        binding.allChannelsButton.setOnClickListener {
            allChatRoomsDialog.show()
        }
        setupMyChatRoomsDialog()
        binding.myChannelsButton.setOnClickListener {
            myChatRoomsDialog.show()
        }
    }

    private fun setUpFragments() {
        // child supportmanager?
        val fragmentTransaction = activity?.supportFragmentManager?.beginTransaction() ?: return
        fragmentTransaction.add(R.id.channel_chat, ChannelChatFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    private fun receiveChatRooms() {
        socket.on("updateChatRooms") { response ->
            chatRooms = jacksonObjectMapper().readValue(response[0].toString(), object: TypeReference<ArrayList<ChatRoom>>() {})
            activity?.runOnUiThread {
                Log.d("chats", chatRooms.last().chatRoomName)
                adapter?.updateData(chatRooms)
            }
        }
        socket.emit("getChatRooms")
    }

    private fun receiveNewChatRoom() {
        socket.on("newChatRoom") { response ->
            chatRooms.add(jacksonObjectMapper().readValue(response[0].toString(), ChatRoom::class.java))
            activity?.runOnUiThread {
                Log.d("chats", chatRooms.last().chatRoomName)
                adapter?.updateData(chatRooms)
            }
        }
    }

    private fun setupAllChatRoomsDialog() {
        allChatRoomsDialog = Dialog(requireContext())
        allChatRoomsDialog.setContentView(R.layout.channels_list_dialog)

        chatsView = allChatRoomsDialog.findViewById(R.id.all_chatrooms)
        chatsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        adapter = AllChatRoomsAdapter(chatRooms)
        chatsView.adapter = adapter

        adapter?.onChatRoomClick = { position, isChecked ->
            val chatName = chatRooms[position].chatRoomName
            if(isChecked) selectedChatRooms.add(chatName)
            else selectedChatRooms.remove(chatName)
        }

        allChatRoomsDialog.findViewById<Button>(R.id.join_button).setOnClickListener {
            // TODO send selected to server doest work
            socket.emit("joinChatRoom", JSONObject(Json.encodeToString(Users.currentUser)), selectedChatRooms.toTypedArray())
            this.selectedChatRooms.clear()
        }
        allChatRoomsDialog.findViewById<Button>(R.id.cancel_button).setOnClickListener {
            this.selectedChatRooms.clear()
            allChatRoomsDialog.dismiss()
        }
    }

    private fun setupMyChatRoomsDialog() {
        myChatRoomsDialog = Dialog(requireContext())
        myChatRoomsDialog.setContentView(R.layout.channels_list_dialog)

        chatsView = myChatRoomsDialog.findViewById(R.id.my_chatrooms)
        chatsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        myChatRoomsAdapter = MyChatRoomsAdapter(chatRooms)
        chatsView.adapter = myChatRoomsAdapter

        adapter?.onChatRoomClick = { position, isChecked ->
            val chatName = chatRooms[position].chatRoomName
            if (isChecked) selectedChatRooms.add(chatName)
            else selectedChatRooms.remove(chatName)
        }

        myChatRoomsDialog.findViewById<Button>(R.id.cancel_button).setOnClickListener {
            this.selectedChatRooms.clear()
            allChatRoomsDialog.dismiss()
        }
    }
}
