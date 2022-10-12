package com.example.scrabbleprototype.model

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R

class LetterRackAdapter(private var letterRack: ArrayList<Letter>) :
    RecyclerView.Adapter<LetterRackAdapter.ViewHolder>() {

    var onLetterClick: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val letter: TextView

        init {
            // Define click listener for the ViewHolder's View.
            letter = view.findViewById(R.id.letter)
            view.setOnClickListener {
                onLetterClick?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.letter_rack_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.letter.text = letterRack[position].value.toString()
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = letterRack.size

    fun updateData(newLetterRack: ArrayList<Letter>) {
        letterRack = newLetterRack
        this.notifyDataSetChanged()
    }

}
