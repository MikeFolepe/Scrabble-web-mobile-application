package com.example.scrabbleprototype.fragments

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ListView
import androidx.fragment.app.Fragment
import com.example.scrabbleprototype.R
import com.google.android.material.floatingactionbutton.FloatingActionButton

class ChannelButtonsFragment : Fragment() {
    var channelsNames = arrayOf("channel1", "channel2", "channel3", "channel4")

    lateinit var adapter: ArrayAdapter<String>
    lateinit var channelsListView: ListView
    lateinit var  dialog: Dialog
    lateinit var channelsDialog: Dialog

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if(savedInstanceState == null) {
            setUpFragments()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_channel_buttons, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val channelsButton = view.findViewById<FloatingActionButton>(R.id.allChannelsButton)
        channelsButton.setOnClickListener(){
            openChannelsDialog()
        }
    }

    private fun setUpFragments() {
        val fragmentTransaction = activity?.supportFragmentManager?.beginTransaction() ?: return
        fragmentTransaction.add(R.id.channel_chat, ChannelChatFragment())
        fragmentTransaction.addToBackStack(null)
        fragmentTransaction.commit()
    }

    fun openChannelsDialog() {
        dialog = Dialog(requireContext())
        dialog.setContentView(R.layout.channels_list_dialog)
        channelsListView = dialog.findViewById(R.id.listView)
        adapter = ArrayAdapter(requireContext(), android.R.layout.simple_list_item_1, channelsNames)
        channelsListView.adapter = adapter
        adapter.notifyDataSetChanged()
        dialog.show()
    }

    companion object {
        /*@JvmStatic
        fun newInstance(param1: String, param2: String) =
            ChannelButtonsFragment().apply {
                arguments = Bundle().apply {
                    putString(ARG_PARAM1, param1)
                    putString(ARG_PARAM2, param2)
                }
            }*/
    }
}
