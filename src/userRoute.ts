import express from "express";
import { app, auth } from "./firebase"; // Import the Firebase app and auth instances
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
      const userData = userDoc.data();
      users.push({ ...userData, documentId: userDoc.id });
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

router.post("/get/user", async (req, res) => {
  try {
    // Fetch the API key from the request headers
    const userAPIKey = req.headers["x-api-key"];

    // Compare the fetched API key with the stored API key
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;
    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get email from the request body
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is required in the request body" });
    }

    // Query the user document with the given email
    const usersCollection = collection(firestore, "Users");
    const querySnapshot = await getDocs(usersCollection);
    let userData = null;

    querySnapshot.forEach((userDoc) => {
      const user = userDoc.data();
      if (user.email === email) {
        userData = { ...user, documentId: userDoc.id };
      }
    });

    if (userData) {
      res.json(userData);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Error fetching user");
  }
});

router.post("/post/signup", async (req, res) => {
  try {
    // Fetch the API key from the request headers
    const userAPIKey = req.headers["x-api-key"];

    // Compare the fetched API key with the stored API key
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;
    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract user credentials from the request body
    const { username, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required in the request body" });
    }

    // Create a new user using Firebase Authentication
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );

    if (userCredential && userCredential.user) {
      const uid = userCredential.user.uid;
      const userEmail = userCredential.user.email;

      if (uid && userEmail) {
        // You can save additional user data to Firestore if needed
        const usersCollection = collection(firestore, "Users");
        await setDoc(doc(usersCollection, uid), {
          username: username,
          email: userEmail,
        });

        return res.json({ message: "User signed up successfully" });
      } else {
        return res.status(500).json({ error: "User data is missing" });
      }
    } else {
      return res.status(500).json({ error: "User creation failed" });
    }
  } catch (error: any) {
    // Explicitly type error as 'any'
    console.error("Error signing up user:", error);
    const errorCode = error.code;
    const errorMessage = error.message;
    return res
      .status(500)
      .json({ error: "Error signing up user", errorCode, errorMessage });
  }
});

router.post("/post/signin", async (req, res) => {
  try {
    // Fetch the API key from the request headers
    const userAPIKey = req.headers["x-api-key"];

    // Compare the fetched API key with the stored API key
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;
    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract user credentials from the request body
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required in the request body" });
    }

    // Sign in user using Firebase Authentication
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );

    if (userCredential && userCredential.user) {
      return res.json({ message: "User signed in successfully" });
    } else {
      return res.status(500).json({ error: "User sign-in failed" });
    }
  } catch (error: any) {
    console.error("Error signing in user:", error);
    const errorCode = error.code;
    const errorMessage = error.message;
    return res
      .status(500)
      .json({ error: "Error signing in user", errorCode, errorMessage });
  }
});

router.post("/update/user", async (req, res) => {
  try {
    const userAPIKey = req.headers["x-api-key"];
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;

    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, username } = req.body; // Renamed to newUsername for clarity

    if (!email || !username) {
      return res.status(400).json({ error: "Email and new username are required in the request body" });
    }

    // Query the user document with the given email
    const usersCollection = collection(firestore, "Users");
    const querySnapshot = await getDocs(usersCollection);
    let userDocRef = null;

    querySnapshot.forEach((userDoc) => {
      const user = userDoc.data();
      if (user.email === email) {
        userDocRef = doc(firestore, "Users", userDoc.id);
      }
    });

    if (userDocRef) {
      await updateDoc(userDocRef, { username: username }); // Update the username
      res.json({ message: "Username updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating user");
  }
});


export default router;
