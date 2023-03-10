package com.example.scrabbleprototype.model


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.google.android.material.floatingactionbutton.FloatingActionButton


class FriendInvitationAdapter(private var invitations: ArrayList<Friend>) :
    RecyclerView.Adapter<FriendInvitationAdapter.ViewHolder>() {

    var onAccept: ((position: Int) -> Unit)? = null
    var onDecline: ((position: Int) -> Unit)? = null
    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val avatar = view.findViewById<ImageView>(R.id.friend_avatar)
        val pseudonym = view.findViewById<TextView>(R.id.friend_pseudonym)
        val acceptButton = view.findViewById<FloatingActionButton>(R.id.invitation_accept)
        val declineButton = view.findViewById<FloatingActionButton>(R.id.invitation_decline)

        init {
            acceptButton.setOnClickListener {
                onAccept?.invoke(layoutPosition)
            }
            declineButton.setOnClickListener {
                onDecline?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.friend_invitation_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        if(invitations[position].avatar == "") viewHolder.avatar.setImageResource(R.color.blue)
        else viewHolder.avatar.setImageResource(R.color.orange_gradient_start)
        // TODO AVATAR NOT HARDCODED
        //viewHolder.avatar.setImageResource(invitations[position].avatar.toInt())
        viewHolder.pseudonym.text = invitations[position].pseudonym
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = invitations.size

    fun updateData(newInvitations: ArrayList<Friend>) {
        invitations = newInvitations
        this.notifyDataSetChanged()
    }

}
