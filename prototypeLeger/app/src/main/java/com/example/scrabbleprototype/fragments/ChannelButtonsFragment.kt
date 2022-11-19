package com.example.scrabbleprototype.fragments

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.ChatRoom
import com.example.scrabbleprototype.model.ChatRoomsAdapter
import com.example.scrabbleprototype.objects.ChatRooms
import com.example.scrabbleprototype.objects.Users
import com.google.android.material.floatingactionbutton.FloatingActionButton

class ChannelButtonsFragment : Fragment() {

    lateinit var adapter: ChatRoomsAdapter
    lateinit var channelsListView: RecyclerView
    lateinit var  dialog: Dialog
    lateinit var channelsDialog: Dialog

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if(savedInstanceState == null) {
            setUpFragments()
        }
        ChatRooms.chatRooms.add(ChatRoom("chat", Users.currentUser, "param3"))
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_channel_buttons, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val channelsButton = view.findViewById<FloatingActionButton>(R.id.allChannelsButton)
        channelsButton.setOnClickListener(){
            openChannelsDialog()
        }
    }

    private fun setUpFragments() {
        val fragmentTransaction = activity?.supportFragmentManager?.beginTransaction() ?: return
        fragmentTransaction.add(R.id.channel_chat, ChannelChatFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    fun openChannelsDialog() {
        dialog = Dialog(requireContext())
        dialog.setContentView(R.layout.channels_list_dialog)
        channelsListView = dialog.findViewById(R.id.recyclerView)
        adapter = ChatRoomsAdapter(ChatRooms.chatRooms)
        channelsListView.adapter = adapter
        adapter.notifyDataSetChanged()
        dialog.show()
    }

    companion object {
        /*@JvmStatic
        fun newInstance(param1: String, param2: String) =
            ChannelButtonsFragment().apply {
                arguments = Bundle().apply {
                    putString(ARG_PARAM1, param1)
                    putString(ARG_PARAM2, param2)
                }
            }*/
    }
}
