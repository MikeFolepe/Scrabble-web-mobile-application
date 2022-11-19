package com.example.scrabbleprototype.model

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R

class ChatRoomsAdapter (private var chatRooms: ArrayList<ChatRoom>) :
    RecyclerView.Adapter<ChatRoomsAdapter.ViewHolder>() {

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val chatRoomName = view.findViewById<TextView>(R.id.name)
        //val deleteButton = view.findViewById<Button>(R.id.delete)
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
        viewHolder.chatRoomName.text = chatRooms[position].name
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = chatRooms.size

    fun updateData(newChatRooms: ArrayList<ChatRoom>) {
        chatRooms = newChatRooms
        this.notifyDataSetChanged()
    }
}
