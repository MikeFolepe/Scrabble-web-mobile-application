package com.example.scrabbleprototype.model


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R


class FriendsListAdapter(private var friends: ArrayList<Friend>) :
    RecyclerView.Adapter<FriendsListAdapter.ViewHolder>() {

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val avatar = view.findViewById<ImageView>(R.id.friend_avatar)
        val pseudonym = view.findViewById<TextView>(R.id.friend_pseudonym)
        val xp = view.findViewById<TextView>(R.id.friend_xp)
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.friend_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        if(friends[position].avatar == "") viewHolder.avatar.setImageResource(R.color.blue)
        else viewHolder.avatar.setImageBitmap(friends[position].getAvatarBitmap())
        viewHolder.pseudonym.text = friends[position].pseudonym
        viewHolder.xp.text = viewHolder.xp.context.getString(R.string.user_xp, friends[position].xpPoints)
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = friends.size

    fun updateData(newFriends: ArrayList<Friend>) {
        friends = newFriends
        this.notifyDataSetChanged()
    }

}
