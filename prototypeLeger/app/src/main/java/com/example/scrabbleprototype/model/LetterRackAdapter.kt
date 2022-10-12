package com.example.scrabbleprototype.model

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R

class LetterRackAdapter(private val letters: ArrayList<Char>) :
    RecyclerView.Adapter<LetterRackAdapter.ViewHolder>() {

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val letter: TextView

        init {
            // Define click listener for the ViewHolder's View.
            letter = view.findViewById(R.id.letter)
            letter.setOnClickListener {
                Toast.makeText(view.context, "position : " + layoutPosition, Toast.LENGTH_LONG).show()
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
        viewHolder.letter.text = letters[position].toString()
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = letters.size

}
