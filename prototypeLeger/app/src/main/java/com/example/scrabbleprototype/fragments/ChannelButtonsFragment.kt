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
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.model.ChatRoom
import com.example.scrabbleprototype.model.ChatRoomsAdapter
import com.example.scrabbleprototype.objects.ChatRooms
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users
import com.google.android.material.floatingactionbutton.FloatingActionButton

class ChannelButtonsFragment : Fragment() {

    lateinit var adapter: ChatRoomsAdapter
    lateinit var chatsView: RecyclerView
    lateinit var  chatRoomsDialog: Dialog

    private lateinit var binding: FragmentChannelButtonsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if(savedInstanceState == null) {
            setUpFragments()
        }
        ChatRooms.chatRooms.add(ChatRoom("chat", Users.currentUser, "chat number 1"))
        ChatRooms.chatRooms.add(ChatRoom("chat", Users.currentUser, "chat number 2"))
        ChatRooms.chatRooms.add(ChatRoom("chat", Users.currentUser, "chat number 3"))
        ChatRooms.chatRooms.add(ChatRoom("chat", Users.currentUser, "chat number 4"))

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
        binding.allChannelsButton.setOnClickListener {
            openChannelsDialog()
        }
    }

    private fun setUpFragments() {
        // child supportmanager?
        val fragmentTransaction = activity?.supportFragmentManager?.beginTransaction() ?: return
        fragmentTransaction.add(R.id.channel_chat, ChannelChatFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    fun openChannelsDialog() {
        chatRoomsDialog = Dialog(requireContext())
        chatRoomsDialog.setContentView(R.layout.channels_list_dialog)

        chatsView = chatRoomsDialog.findViewById(R.id.all_chatrooms)
        chatsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        adapter = ChatRoomsAdapter(ChatRooms.chatRooms)
        chatsView.adapter = adapter

        chatRoomsDialog.findViewById<Button>(R.id.join_button).setOnClickListener { //TODO
        }
        chatRoomsDialog.findViewById<Button>(R.id.cancel_button).setOnClickListener { chatRoomsDialog.dismiss()}

        chatRoomsDialog.show()
    }
}
