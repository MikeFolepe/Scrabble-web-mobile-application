package com.example.scrabbleprototype.model


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import org.w3c.dom.Text


class PossibleWordsAdapter(private var words: ArrayList<PossibleWords>) :
    RecyclerView.Adapter<PossibleWordsAdapter.ViewHolder>() {

    var onWordClick: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {

        val word = view.findViewById<TextView>(R.id.possible_word)
        val wordPoints = view.findViewById<TextView>(R.id.possible_word_points)
        val wordOrientation = view.findViewById<TextView>(R.id.possible_word_orientation)
        val playButton = view.findViewById<Button>(R.id.play_possible_word)

        init {
            playButton.setOnClickListener {
                onWordClick?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.possible_word_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.word.text = words[position].word
        viewHolder.wordPoints.text = viewHolder.wordPoints.context.getString(R.string.possible_word_points, words[position].point)
        if(words[position].orientation == Orientation.Horizontal) viewHolder.wordOrientation.text = viewHolder.wordOrientation.context.getString(R.string.horizontal)
        else viewHolder.wordOrientation.text = viewHolder.wordOrientation.context.getString(R.string.vertical)
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = words.size

    fun updateData(newWords: ArrayList<PossibleWords>) {
        words = newWords
        this.notifyDataSetChanged()
    }
}
