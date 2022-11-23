package com.example.scrabbleprototype.model

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.Users

class MyChatRoomsAdapter (private var myChatRooms: ArrayList<ChatRoom>) :
    RecyclerView.Adapter<MyChatRoomsAdapter.ViewHolder>() {

    var onChatRoomClick: ((position: Int, isChecked: Boolean) -> Unit)? = null
    var onLeave: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val name = view.findViewById<TextView>(R.id.name)
        val leaveButton = view.findViewById<Button>(R.id.leave)
        val checkbox = view.findViewById<CheckBox>(R.id.radio_button)

        init {
            checkbox.setOnCheckedChangeListener { buttonView, isChecked ->
                onChatRoomClick?.invoke(layoutPosition, isChecked)
            }
            leaveButton.setOnClickListener {
                myChatRooms.removeAt(layoutPosition)
                SocketHandler.socket.emit("leaveChatRoom", Users.currentUser.pseudonym, myChatRooms[layoutPosition].chatRoomName)
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
        viewHolder.name.text = myChatRooms[position].chatRoomName
        viewHolder.leaveButton.visibility = View.VISIBLE
        // viewHolder.deleteButton.visibility = View.INVISIBLE
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = myChatRooms.size

    fun updateData(myNewChatRooms: ArrayList<ChatRoom>) {
        myChatRooms = myNewChatRooms
        this.notifyDataSetChanged()
    }
}
