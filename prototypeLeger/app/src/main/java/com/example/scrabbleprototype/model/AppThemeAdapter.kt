package com.example.scrabbleprototype.model

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import androidx.annotation.LayoutRes
import androidx.core.content.ContextCompat
import com.example.scrabbleprototype.R

class AppThemeAdapter(context: Context, @LayoutRes private val layoutResource: Int, private val themes: ArrayList<String>):
    ArrayAdapter<String>(context, layoutResource, themes) {

    private var _themes: ArrayList<String> = themes
    private val itemBackgrounds = arrayListOf<Drawable?>()
    private val itemTextColor = arrayListOf<Int>()

    init {
        setupColors()
    }

    override fun getCount(): Int {
        return _themes.size
    }

    override fun getItem(index: Int): String {
        return _themes[index]
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        return createViewFromResource(position, convertView, parent)
    }

    override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup?): View {
        return createViewFromResource(position, convertView, parent)
    }

    private fun createViewFromResource(position: Int, convertView: View?, parent: ViewGroup?): View {
        val view = convertView as TextView? ?: LayoutInflater.from(context).inflate(layoutResource, parent, false) as TextView
        view.text = _themes[position]
        view.background = itemBackgrounds[position]
        view.setTextColor(itemTextColor[position])
        return view
    }

    private fun setupColors() {
        itemBackgrounds.add(ContextCompat.getDrawable(context, R.color.lime_green))
        itemTextColor.add(ContextCompat.getColor(context, R.color.green))
        itemBackgrounds.add(ContextCompat.getDrawable(context, R.color.gray))
        itemTextColor.add(ContextCompat.getColor(context, R.color.black))
        itemBackgrounds.add(ContextCompat.getDrawable(context, R.color.light_blue))
        itemTextColor.add(ContextCompat.getColor(context, R.color.blue))
        itemBackgrounds.add(ContextCompat.getDrawable(context, R.color.light_orange))
        itemTextColor.add(ContextCompat.getColor(context, R.color.orange))
    }
}
