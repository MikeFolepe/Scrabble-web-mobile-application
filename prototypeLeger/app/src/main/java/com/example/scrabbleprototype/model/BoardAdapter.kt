 package com.example.scrabbleprototype.model

import android.content.ClipData
import android.content.ClipDescription
import android.os.Build
import android.util.Log
import android.view.DragEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.cardview.widget.CardView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.LetterRack
import com.example.scrabbleprototype.objects.Players

class BoardAdapter(private var board: ArrayList<Letter>) :
    RecyclerView.Adapter<BoardAdapter.ViewHolder>() {

    var onCaseClicked: ((position: Int) -> Unit)? = null
    var onPlacement: ((letterRackPosition: Int, boardPosition: Int, draggedFromRack: Boolean) -> Unit)? = null
    var bonusInit = false

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
            setupDragListener(view)
        }

        private fun setupDragListener(view: View) {
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
                        if(!Players.currentPlayer.getTurn()) return@setOnDragListener false

                        val letterTouched = e.clipData.getItemAt(0)
                        val letterQuantity: Int = e.clipData.getItemAt(1).text.toString().toInt()
                        val letterScore: Int = e.clipData.getItemAt(2).text.toString().toInt()
                        val dragStartPosition: Int = e.clipData.getItemAt(3).text.toString().toInt()
                        val draggedFromRack = e.clipData.getItemAt(4).text.toString().toBoolean()
                        val dragData = letterTouched.text // La data de la lettre qui a été dragged

                        // Add letter dropped to board
                        board[bindingAdapterPosition] = Letter(dragData.first().toString().lowercase(), letterQuantity, letterScore, false, false)
                        notifyItemChanged(bindingAdapterPosition)
                        // Remove letter dragged of letterRack
                        onPlacement?.invoke(dragStartPosition, bindingAdapterPosition, draggedFromRack)
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

        setupTouchListener(viewHolder)
        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        val letterLayer =  viewHolder.case.findViewById<LinearLayout>(R.id.letter_layer)
        val bonusLayer = viewHolder.case.findViewById<TextView>(R.id.bonus_layer)

        if(board[position].value == "")  {
            setupBonus(bonusLayer, position, viewHolder)
            letterLayer.setBackgroundResource(0)
            letterLayer.findViewById<TextView>(R.id.letter_score).text = ""
            letterLayer.findViewById<TextView>(R.id.letter).text = ""
        } else {
            bonusLayer.setBackgroundResource(0)
            bonusLayer.text = ""
            letterLayer.background = ContextCompat.getDrawable(viewHolder.case.context, R.drawable.tan)
            letterLayer.findViewById<TextView>(R.id.letter).text = board[position].value.uppercase()
            letterLayer.findViewById<TextView>(R.id.letter_score).text = board[position].points.toString()
        }
    }

    private fun setupTouchListener(viewHolder: ViewHolder) {
        viewHolder.case.findViewById<LinearLayout>(R.id.letter_layer).setOnLongClickListener { v ->
            if(board[viewHolder.layoutPosition].isValidated || board[viewHolder.layoutPosition].isEmpty()) return@setOnLongClickListener false
            Log.d("boardDrag", "touching")
            val letterTouched = ClipData.Item(board[viewHolder.layoutPosition].value)
            val letterQuantity = ClipData.Item(board[viewHolder.layoutPosition].quantity.toString())
            val letterScore = ClipData.Item(board[viewHolder.layoutPosition].points.toString())
            val positionTouched = ClipData.Item(viewHolder.layoutPosition.toString())
            val isDraggedFromRack = ClipData.Item(false.toString())
            val dragData = ClipData(
                board[viewHolder.layoutPosition].value,
                arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN),
                letterTouched
            )
            dragData.addItem(letterQuantity)
            dragData.addItem(letterScore)
            dragData.addItem(positionTouched)
            dragData.addItem(isDraggedFromRack)

            val shadowBuilder: View.DragShadowBuilder = View.DragShadowBuilder(v)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                v?.startDragAndDrop(dragData, shadowBuilder, null, 0)
            } else {
                v?.startDrag(dragData, shadowBuilder, null, 0)
            }
            true
        }
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = board.size

    fun updateData(newBoard: ArrayList<Letter>) {
        board = newBoard
        this.notifyDataSetChanged()
    }

    fun setupBonus(bonusLayer: TextView, position: Int, viewHolder: ViewHolder) {
        if(bonusInit)
        Log.d("bonus", "settingBonuses at " + position.toString())
        if(position == Constants.BOARD_CENTER) bonusLayer.background = ContextCompat.getDrawable(viewHolder.case.context, R.drawable.ic_baseline_star_24)

        when(Constants.BONUS_POSITIONS[position]) {
            "doubleLetter" -> {
                bonusLayer.text = "Lettre\nx2"
                bonusLayer.background = ContextCompat.getDrawable(viewHolder.case.context, R.color.light_cyan)
            }
            "doubleWord" -> {
                bonusLayer.text = "Mot\nx2"
                bonusLayer.background = ContextCompat.getDrawable(viewHolder.case.context, R.color.light_red)
            }
            "tripleLetter" -> {
                bonusLayer.text = "Lettre\nx3"
                bonusLayer.background = ContextCompat.getDrawable(viewHolder.case.context, R.color.teal)
            }
            "tripleWord" -> {
                bonusLayer.text = "Mot\nx3"
                bonusLayer.background = ContextCompat.getDrawable(viewHolder.case.context, R.color.red)
            }
        }
        if(position == Constants.LAST_BOARD_POSITION) bonusInit = true
    }

}
