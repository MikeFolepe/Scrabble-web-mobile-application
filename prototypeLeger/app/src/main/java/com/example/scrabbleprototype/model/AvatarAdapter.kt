package com.example.scrabbleprototype.model

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import de.hdodenhof.circleimageview.CircleImageView

class AvatarAdapter(private var avatarList: ArrayList<Int>) : RecyclerView.Adapter<AvatarAdapter.ViewHolder>() {
    var onClickAvatar: ((position: Int) -> Unit)? = null
    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        var avatar: ImageView

        init {
            // Define click listener for the ViewHolder's View.
            avatar = view.findViewById(R.id.avatar)
            avatar.setOnClickListener {
                onClickAvatar?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): AvatarAdapter.ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.avatar_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: AvatarAdapter.ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.avatar.setImageResource(avatarList.get(position))

    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = avatarList.size

    fun updateData(newAvatarList: ArrayList<Int>) {
        avatarList = newAvatarList
        this.notifyDataSetChanged()
    }
}

