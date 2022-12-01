package environments

object Environment {
    val production = false
    // Pour emulateur
    //const val serverUrl = "http://ec2-15-222-249-18.ca-central-1.compute.amazonaws.com:3000"
    // Pour tablette physique
    val serverUrl = "http://192.168.0.31:3000"
    // Pour serveur aws
   // val serverUrl = "http://ec2-15-222-249-18.ca-central-1.compute.amazonaws.com:3000"
}

