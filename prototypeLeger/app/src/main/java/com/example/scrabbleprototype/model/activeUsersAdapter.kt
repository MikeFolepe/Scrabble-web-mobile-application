package com.example.scrabbleprototype.model


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.google.android.material.floatingactionbutton.FloatingActionButton


class ActiveUsersAdapter(private var activeUsers: ArrayList<Friend>) :
    RecyclerView.Adapter<ActiveUsersAdapter.ViewHolder>() {

    var onUserClick: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val avatar: ImageView
        val pseudonym: TextView
        val xp: TextView
        val addButton: FloatingActionButton

        init {
            avatar = view.findViewById(R.id.active_user_avatar)
            pseudonym = view.findViewById(R.id.active_user_pseudonym)
            xp = view.findViewById(R.id.active_user_xp)
            addButton = view.findViewById(R.id.add_active_user_button)
            addButton.setOnClickListener {
                onUserClick?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.active_user_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        if(activeUsers[position].avatar == "") viewHolder.avatar.setImageResource(R.color.blue)
        else viewHolder.avatar.setImageResource(activeUsers[position].avatar.toInt())
        viewHolder.pseudonym.text = activeUsers[position].pseudonym
        viewHolder.xp.text = viewHolder.xp.context.getString(R.string.user_xp, activeUsers[position].xpPoints)
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = activeUsers.size

    fun updateData(newActiveUsers: ArrayList<Friend>) {
        activeUsers = newActiveUsers
        this.notifyDataSetChanged()
    }

}

