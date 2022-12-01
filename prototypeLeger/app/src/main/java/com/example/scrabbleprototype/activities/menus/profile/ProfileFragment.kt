package com.example.scrabbleprototype.activities.menus.profile

import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.ContextThemeWrapper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentHomeBinding
import com.example.scrabbleprototype.databinding.FragmentProfileBinding
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Themes
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import java.util.*
import kotlin.concurrent.timerTask

class ProfileFragment : Fragment() {

    private val user = Users
    private lateinit var addFriendDialog: Dialog
    private var activeUsers = arrayListOf<Friend>()

    private lateinit var binding: FragmentProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        for(i in 0 until 12) user.friends.add(Friend("ami #" + i, (R.color.blue).toString(), 250 + i))
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentProfileBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        receiveActiveUsers()
        setupUserInfo()
        setupFriendsList()
        setupAddFriendButton()

        super.onViewCreated(view, savedInstanceState)
    }

    private fun receiveActiveUsers() {
        SocketHandler.socket.on("activeUsers") { response ->
            activeUsers = jacksonObjectMapper().readValue(response[0].toString(), object: TypeReference<ArrayList<Friend>>() {})
            Log.d("activeusers", "received")
        }
        SocketHandler.socket.emit("sendActiveUsers", user.currentUser.pseudonym)
    }

    private fun setupUserInfo() {
        binding.userPseudonym.text = user.currentUser.pseudonym
        binding.userXp.text = getString(R.string.user_xp, user.currentUser.xpPoints)
        binding.userAvatar.setImageBitmap(user.avatarBmp)
    }

    private fun setupFriendsList() {
        val friendsListView = binding.friendsList
        friendsListView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
<<<<<<< HEAD
        val friendsListAdapter = FriendsListAdapter(user.currentUser.friendsList)
=======
        val friendsListAdapter = FriendsListAdapter(user.friends)
>>>>>>> mobile-endgame
        friendsListView.adapter = friendsListAdapter
    }

    private fun setupAddFriendDialog() {
        addFriendDialog = Dialog(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
        addFriendDialog.setContentView(R.layout.add_friend_dialog)

        val activeUsersView = addFriendDialog.findViewById<RecyclerView>(R.id.active_users)
        activeUsersView.layoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.VERTICAL, false)
        val activeUsersAdapter = ActiveUsersAdapter(activeUsers)
        activeUsersView.adapter = activeUsersAdapter

        Log.d("activeusers", "setuped")

        activeUsersAdapter.onUserClick = { position ->
<<<<<<< HEAD
            user.currentUser.friendsList.add(activeUsers[position])
=======
            user.friends.add(activeUsers[position])
>>>>>>> mobile-endgame
            // TODO send invitation
            Toast.makeText(addFriendDialog.context, "Une invitation d'ami a été envoyée à " + activeUsers[position].pseudonym, Toast.LENGTH_LONG).show()
            Timer().schedule(timerTask {
                addFriendDialog.dismiss()
            }, 200)
        }

        val dismissButton = addFriendDialog.findViewById<Button>(R.id.dismiss_dialog_button)
        dismissButton.setOnClickListener {
            addFriendDialog.dismiss()
        }
    }

    private fun setupAddFriendButton() {
        binding.addFriendButton.setOnClickListener {
            setupAddFriendDialog()
            addFriendDialog.show()
        }
    }
}
