package com.example.scrabbleprototype.model

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.RadioButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.ChatRooms
import com.example.scrabbleprototype.objects.Users

class MyChatRoomsAdapter (private var chatRooms: ArrayList<ChatRoom>) :
    RecyclerView.Adapter<MyChatRoomsAdapter.ViewHolder>() {

    private var selectedPosition: Int = -1

    var onChatRoomClick: ((position: Int, isChecked: Boolean) -> Unit)? = null
    var onLeave: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val name = view.findViewById<TextView>(R.id.name)
        val leaveButton = view.findViewById<Button>(R.id.leave)
        val radioButton = view.findViewById<RadioButton>(R.id.radio_button)

        init {
            radioButton.setOnCheckedChangeListener { buttonView, isChecked ->
                if(isChecked) {
                    selectedPosition = layoutPosition
                    onChatRoomClick?.invoke(layoutPosition, isChecked)
                }
            }
            leaveButton.setOnClickListener {
                if(selectedPosition == layoutPosition) ChatRooms.chatRoomToChange.value = ""
                selectedPosition = chatRooms.indexOfFirst { it.chatRoomName == ChatRooms.chatRoomToChange.value }

                SocketHandler.socket.emit("leaveChatRoom", Users.currentUser.pseudonym, chatRooms[layoutPosition].chatRoomName)
                chatRooms.removeAt(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.my_chat_room_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.name.text = chatRooms[position].chatRoomName
        if(position != 0 && chatRooms[position].creator.pseudonym != Users.currentUser.pseudonym) {
            viewHolder.leaveButton.visibility = View.VISIBLE
        }

        viewHolder.radioButton.isChecked = position == selectedPosition
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = chatRooms.size

    fun updateData(myNewChatRooms: ArrayList<ChatRoom>) {
        chatRooms = myNewChatRooms
        this.notifyDataSetChanged()
    }
}
