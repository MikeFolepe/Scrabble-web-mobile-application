package com.example.scrabbleprototype.fragments

import android.app.Dialog
import android.content.DialogInterface
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentChannelButtonsBinding
import com.example.scrabbleprototype.model.AllChatRoomsAdapter
import com.example.scrabbleprototype.model.ChatRoom
import com.example.scrabbleprototype.model.MyChatRoomsAdapter
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.objects.ChatRooms
import com.example.scrabbleprototype.objects.ChatRooms.chatRoomToChange
import com.example.scrabbleprototype.objects.ChatRooms.chatRooms
import com.example.scrabbleprototype.objects.ChatRooms.myChatRooms
import com.example.scrabbleprototype.objects.ChatRooms.currentChatRoom
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Users.currentUser
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject

class ChannelButtonsFragment : Fragment() {

    private var selectedChatRooms = arrayListOf<String>()

    private var adapter: AllChatRoomsAdapter? = null
    private var myChatRoomsAdapter: MyChatRoomsAdapter? = null
    lateinit var chatsView: RecyclerView
    lateinit var myChatsView: RecyclerView

    lateinit var  allChatRoomsDialog: Dialog
    lateinit var  myChatRoomsDialog: Dialog
    lateinit var CreateChatRoomDialog: Dialog
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
        binding.allChatRoomsButton.setOnClickListener {
            allChatRoomsDialog.show()
        }
        setupMyChatRoomsDialog()
        binding.myChatRoomsButton.setOnClickListener {
            updateMyChatRooms()
            myChatRoomsDialog.show()
        }
        setupCreateChatRoomDialog()
        binding.createChatRoomButton.setOnClickListener {
            CreateChatRoomDialog.show()
        }
    }

    private fun setUpFragments() {
        // child supportmanager?
        val fragmentTransaction = childFragmentManager.beginTransaction() ?: return
        fragmentTransaction.add(R.id.channel_chat, ChatRoomFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    private fun receiveChatRooms() {
        socket.on("updateChatRooms") { response ->
            chatRooms = jacksonObjectMapper().readValue(response[0].toString(), object: TypeReference<ArrayList<ChatRoom>>() {})
            activity?.runOnUiThread {
                adapter?.updateData(chatRooms)
                myChatRoomsAdapter?.updateData(myChatRooms)
            }
        }
        socket.emit("getChatRooms")
    }

    private fun updateMyChatRooms() {
        myChatRooms = arrayListOf(chatRooms[0])
        for (chatRoom in chatRooms) {
            // if the chatRoom is the main room, skip it
            if (chatRoom.chatRoomName === chatRooms[0].chatRoomName) {
                continue;
            }
            if (chatRoom.containsUser(currentUser)) {
                myChatRooms.add(chatRoom)
            }
        }
        myChatRoomsAdapter?.updateData(myChatRooms)
    }

    private fun receiveNewChatRoom() {
        socket.on("newChatRoom") { response ->
            chatRooms.add(jacksonObjectMapper().readValue(response[0].toString(), ChatRoom::class.java))
            activity?.runOnUiThread {
                adapter?.notifyItemChanged(chatRooms.size - 1)
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

        // setup search view

        adapter?.onChatRoomClick = { position, isChecked ->
            val chatName = chatRooms[position].chatRoomName
            if(isChecked) selectedChatRooms.add(chatName)
            else selectedChatRooms.remove(chatName)
        }

        allChatRoomsDialog.findViewById<Button>(R.id.join_button).setOnClickListener {
            socket.emit("joinChatRoom", JSONObject(Json.encodeToString(currentUser)), JSONArray(Json.encodeToString(selectedChatRooms.toTypedArray())))
            this.selectedChatRooms.clear()
            uncheckAllCheckBoxes(chatsView)
            allChatRoomsDialog.dismiss()
        }
        allChatRoomsDialog.findViewById<Button>(R.id.cancel_button).setOnClickListener {
            this.selectedChatRooms.clear()
            uncheckAllCheckBoxes(chatsView)
            allChatRoomsDialog.dismiss()
        }
    }

    private fun setupMyChatRoomsDialog() {
        myChatRoomsDialog = Dialog(requireContext())
        myChatRoomsDialog.setContentView(R.layout.my_channels_list_dialog)

        myChatsView = myChatRoomsDialog.findViewById(R.id.my_chatrooms)
        myChatsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        myChatRoomsAdapter = MyChatRoomsAdapter(myChatRooms)
        myChatsView.adapter = myChatRoomsAdapter

        val chatRoomToChangeObserver = Observer<String> { chatRoomToChange ->
            Log.d("observe", chatRoomToChange)
            val changeButton = myChatRoomsDialog.findViewById<Button>(R.id.change_button)
            changeButton.isEnabled = chatRoomToChange != "" && chatRoomToChange != currentChatRoom?.chatRoomName
        }
        chatRoomToChange.observe(viewLifecycleOwner, chatRoomToChangeObserver)

        myChatRoomsAdapter?.onChatRoomClick = { position, isChecked ->
            chatRoomToChange.value = myChatRooms[position].chatRoomName
            myChatsView.post { myChatRoomsAdapter?.notifyDataSetChanged() }
        }

        myChatRoomsDialog.findViewById<Button>(R.id.change_button).setOnClickListener {
            currentChatRoom = myChatRooms.find { it.chatRoomName == chatRoomToChange.value }
            Log.d("currentChat", currentChatRoom?.chatRoomName.toString())
            recreateChatFragment()
            myChatRoomsDialog.dismiss()
        }

        myChatRoomsDialog.findViewById<Button>(R.id.cancel_button).setOnClickListener {
            myChatRoomsDialog.dismiss()
        }
    }

    private fun setupCreateChatRoomDialog() {
        // val inputEditTextField = EditText(requireActivity())
        val inflater = requireActivity().layoutInflater
        val createView = inflater.inflate(R.layout.create_chat_room_dialog, null)
        val newChatRoomName = createView.findViewById<EditText>(R.id.new_chatroom_name)

        CreateChatRoomDialog = AlertDialog.Builder(requireContext())
            .setView(createView)
            .setPositiveButton("Create", DialogInterface.OnClickListener { dialog, id ->
                socket.emit("createChatRoom", JSONObject(Json.encodeToString(currentUser)), newChatRoomName.text.toString())
            })
            .setNegativeButton("Cancel", null)
            .create()
    }
    private fun uncheckAllCheckBoxes(chatsView: RecyclerView) {
        for(i in 0 until chatRooms.size) {
            val chatItem = chatsView.findViewHolderForAdapterPosition(i)?.itemView
            chatItem?.findViewById<CheckBox>(R.id.checkbox)?.isChecked = false
        }
    }

    private fun uncheckAllRadioButtons(chatsView: RecyclerView) {

    }

    private fun recreateChatFragment() {
        val supportFragmentManager = childFragmentManager
        Log.d("recreate", childFragmentManager.fragments.size.toString())
        Log.d("recreate", childFragmentManager.fragments[0].javaClass.name)
        val fragment = supportFragmentManager.findFragmentById(R.id.channel_chat) ?: return
        Log.d("recreate", "detaching")
        supportFragmentManager.beginTransaction().detach(fragment).commit()
        supportFragmentManager.executePendingTransactions()
        supportFragmentManager.beginTransaction().attach(fragment).commit()
    }
}
