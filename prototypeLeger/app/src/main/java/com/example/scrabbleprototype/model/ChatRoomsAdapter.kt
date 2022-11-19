package com.example.scrabbleprototype.model

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.ChatRooms
import com.example.scrabbleprototype.objects.Users

class ChatRoomsAdapter (private var chatRooms: ArrayList<ChatRoom>) :
    RecyclerView.Adapter<ChatRoomsAdapter.ViewHolder>() {

    var onChatRoomClick: ((position: Int, isChecked: Boolean) -> Unit)? = null
    var onDelete: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val name = view.findViewById<TextView>(R.id.name)
        val deleteButton = view.findViewById<Button>(R.id.delete)
        val checkbox = view.findViewById<CheckBox>(R.id.checkbox)

        init {
            checkbox.setOnCheckedChangeListener { buttonView, isChecked ->
                onChatRoomClick?.invoke(layoutPosition, isChecked)
            }
            deleteButton.setOnClickListener {
                ChatRooms.chatRooms.removeAt(layoutPosition)
                SocketHandler.socket.emit("deleteChatRoom", layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.chat_room_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.name.text = chatRooms[position].chatRoomName
        if(chatRooms[position].creator.pseudonym == Users.currentUser.pseudonym) {
            viewHolder.deleteButton.visibility = View.VISIBLE
        }
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = chatRooms.size

    fun updateData(newChatRooms: ArrayList<ChatRoom>) {
        chatRooms = newChatRooms
        this.notifyDataSetChanged()
    }
}
