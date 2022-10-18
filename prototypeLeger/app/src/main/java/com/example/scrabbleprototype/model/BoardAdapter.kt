package com.example.scrabbleprototype.model

import android.content.ClipDescription
import android.util.Log
import android.view.DragEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.cardview.widget.CardView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R

class BoardAdapter(private var board: ArrayList<Letter>) :
    RecyclerView.Adapter<BoardAdapter.ViewHolder>() {

    var onCaseClicked: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val case: CardView

        init {
            // Define click listener for the ViewHolder's View.
            case = view.findViewById(R.id.board_case)
            view.setOnClickListener {
                onCaseClicked?.invoke(layoutPosition)
            }
            // Drag listener for board cases
            view.setOnDragListener { v, e ->
                when(e.action) {
                    DragEvent.ACTION_DRAG_STARTED -> {
                        return@setOnDragListener e.clipDescription.hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN)
                    }
                    DragEvent.ACTION_DRAG_ENTERED -> {
                        // Can modify view here to show that the view is being dragged
                        true
                    }
                    DragEvent.ACTION_DRAG_EXITED -> {
                        // Modify view style back to DRAG_STARTED DragEvent
                        true
                    }
                    DragEvent.ACTION_DROP -> {
                        val item = e.clipData.getItemAt(0)
                        val dragData = item.text // La data de la lettre qui a été dragged

                        // Case du board ou la lettre a été drop
                        board[bindingAdapterPosition] = Letter(dragData.first(), 10, 10, false, false)
                        // TODO Ajoute la lettre a la case avec le dragData

                        notifyItemChanged(bindingAdapterPosition)
                        true
                    }
                    DragEvent.ACTION_DRAG_ENDED -> {
                        when(e.result) {
                            true ->
                                Toast.makeText(v.context, "DROP SUCCESSFUL", Toast.LENGTH_LONG)
                            else ->
                                Toast.makeText(v.context, "DROP DIDN'T WORK", Toast.LENGTH_LONG)
                        }.show()
                        true
                    }
                    else -> {
                        Log.d("dragdrop", "Unknown Action type received by the drag listener")
                        false
                    }
                }
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.board_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        val letterLayer =  viewHolder.case.findViewById<LinearLayout>(R.id.letter_layer)

        if(board[position].value == ' ')  {
            letterLayer.background = ContextCompat.getDrawable(viewHolder.case.context, R.drawable.transparent)
            letterLayer.findViewById<TextView>(R.id.letter_score).text = ""
        } else {
            letterLayer.background = ContextCompat.getDrawable(viewHolder.case.context, R.drawable.tan)
            viewHolder.case.findViewById<TextView>(R.id.letter).text = board[position].value.toString()
            viewHolder.case.findViewById<TextView>(R.id.letter_score).text = board[position].point.toString()
        }
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = board.size

    fun updateData(newBoard: ArrayList<Letter>) {
        board = newBoard
        this.notifyDataSetChanged()
    }

}
