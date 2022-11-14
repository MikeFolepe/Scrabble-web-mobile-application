package com.example.scrabbleprototype.model


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R



class ThemeAdapter(private var themes: ArrayList<Item>) :
    RecyclerView.Adapter<ThemeAdapter.ViewHolder>() {

    var onThemeClick: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val themeName: TextView
        val themePreview: ImageView
        val themeDescription: TextView

        init {
            themeName = view.findViewById(R.id.theme_name)
            themePreview = view.findViewById(R.id.theme_color)
            themeDescription = view.findViewById(R.id.theme_description)
            view.setOnClickListener {
                onThemeClick?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.theme_dialog_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.themeName.text = themes[position].name
        viewHolder.themePreview.setImageResource(themes[position].theme)
        viewHolder.themeDescription.text = themes[position].description
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = themes.size

    fun updateData(newThemes: ArrayList<Item>) {
        themes = newThemes
        this.notifyDataSetChanged()
    }

}

