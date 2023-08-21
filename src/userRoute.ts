import express from "express";
import { app } from "./firebase"; // Import the Firebase app instance
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore"; // Import Firestore functions

const router = express.Router();
const firestore = getFirestore(app);

// Middleware to parse JSON bodies
router.use(express.json());

router.get("/get/allUsers", async (req, res) => {
  try {
    // Fetch the API key from the request headers
    const userAPIKey = req.headers["x-api-key"];

    // Compare the fetched API key with the stored API key
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;
    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Retrieve user data from Firestore collection
    const usersCollection = collection(firestore, "Users");
    const userSnapshot = await getDocs(usersCollection);

    const users: any[] = [];
    userSnapshot.forEach((userDoc) => {
      // Include the document name as "username"
      const userData = userDoc.data();
      users.push({ ...userData, username: userDoc.id });
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

router.get("/get/user", async (req, res) => {
  try {
    // Fetch the API key from the request headers
    const userAPIKey = req.headers["x-api-key"];

    // Compare the fetched API key with the stored API key
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;
    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get username from the request body
    const { username } = req.body;

    if (!username) {
      return res
        .status(400)
        .json({ error: "Username is required in the request body" });
    }

    // Fetch the user document using the username as the document ID
    const usersCollection = collection(firestore, "Users");
    const userDoc = await getDoc(doc(usersCollection, username));

    if (!userDoc.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    res.json({ ...userData, username: username }); // Using the username as the document name
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Error fetching user");
  }
});

export default router;
