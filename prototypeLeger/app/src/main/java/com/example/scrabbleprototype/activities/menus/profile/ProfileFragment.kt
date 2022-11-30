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
import com.example.scrabbleprototype.databinding.FragmentFeaturesBinding
import com.example.scrabbleprototype.databinding.FragmentHomeBinding
import com.example.scrabbleprototype.databinding.FragmentProfileBinding
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Themes
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.lang.Exception
import java.util.*
import kotlin.collections.ArrayList
import kotlin.concurrent.timerTask
import kotlin.coroutines.CoroutineContext

class ProfileFragment : Fragment(), CoroutineScope {

    private val user = Users.currentUser
    private lateinit var addFriendDialog: Dialog
    private var users = arrayListOf<User>()
    private lateinit var userAdapter: UserAdapter
    private lateinit var invitationAdapter: FriendInvitationAdapter

    private lateinit var binding: FragmentProfileBinding
    private var client = HttpClient() {
        install(ContentNegotiation) {}
    }
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + job

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        for(i in 0 until 12) {
            user.friendsList.add(Friend("ami #" + i, (R.color.blue).toString(), 250 + i))
            user.invitations.add(User("", "", "", "", false, ""))
        }
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
        setupUserInfo()
        setupFriendsList()
        setupInvitations()
        setupAddFriendButton()
        receiveFriendRequest()

        super.onViewCreated(view, savedInstanceState)
    }

    private fun setupUserInfo() {
        binding.userPseudonym.text = user.pseudonym
        binding.userXp.text = getString(R.string.user_xp, user.xpPoints)
    }

    private fun setupFriendsList() {
        val friendsListView = binding.friendsList
        friendsListView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        val friendsListAdapter = FriendsListAdapter(user.friends)
        friendsListView.adapter = friendsListAdapter
    }

    private fun setupInvitations() {
        val invitationsView = binding.invitationsList
        invitationsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        invitationAdapter = FriendInvitationAdapter(user.invitations)
        invitationsView.adapter = invitationAdapter
    }

    private fun setupAddFriendDialog() {
        addFriendDialog = Dialog(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
        addFriendDialog.setContentView(R.layout.add_friend_dialog)

        val usersView = addFriendDialog.findViewById<RecyclerView>(R.id.users)
        usersView.layoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.VERTICAL, false)
        userAdapter = UserAdapter(users)
        usersView.adapter = userAdapter

        userAdapter.onUserClick = { position ->
            SocketHandler.socket.emit("sendFriendRequest", JSONObject(Json.encodeToString(user)), JSONObject(Json.encodeToString(users[position])))
            Toast.makeText(addFriendDialog.context, "Une invitation d'ami a été envoyée à " + users[position].pseudonym, Toast.LENGTH_LONG).show()
            Timer().schedule(timerTask {
                addFriendDialog.dismiss()
            }, 200)
        }

        val dismissButton = addFriendDialog.findViewById<Button>(R.id.dismiss_dialog_button)
        dismissButton.setOnClickListener {
            addFriendDialog.dismiss()
        }
    }

    private fun receiveFriendRequest() {
        SocketHandler.socket.on("receiveFriendRequest") { response ->
            Log.d("receive request", "RECEIVED")
            val sender = jacksonObjectMapper().readValue(response[0].toString(), User::class.java)
            user.invitations.add(sender)
            activity?.runOnUiThread { invitationAdapter.updateData(user.invitations) }
        }
    }

    private fun setupAddFriendButton() {
        setupAddFriendDialog()
        binding.addFriendButton.setOnClickListener {
            // update adapter and users
            launch { getAllUsers() }
            addFriendDialog.show()
        }
    }

    private suspend fun getAllUsers() {
        var response: HttpResponse?
        try{
            response = client.get(environments.Environment.serverUrl + "/api/user/users") {}
        } catch(e: Exception) {
            response = null
        }
        if(response != null) {
            users = jacksonObjectMapper().readValue(response.body() as String, object : TypeReference<ArrayList<User>>() {})
            users.removeAll { it.pseudonym == Users.currentUser.pseudonym }
            activity?.runOnUiThread {
                userAdapter.updateData(users)
            }
        }
    }
}
