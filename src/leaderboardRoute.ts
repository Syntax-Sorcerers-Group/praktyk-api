import express from "express";
import { app, auth } from "./firebase"; // Import the Firebase app and auth instances
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore"; // Import Firestore functions

const router = express.Router();
const firestore = getFirestore(app);

// Middleware to parse JSON bodies
router.use(express.json());

//Route to get all grammar of the specified grade
router.post("/get/gradeLeaderboard", async (req, res) => {
  try {
    // Fetch the API key from the request headers
    const userAPIKey = req.headers["x-api-key"];

    // Compare the fetched API key with the stored API key
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;
    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get the grade from the request body
    const { grade } = req.body;

    if (!grade) {
      return res
        .status(400)
        .json({ error: "Grade is required in the request body" });
    }

    // Query the Firestore collection for the given grade
    const grammarCollection = collection(firestore, "Leaderboard");
    const gradeDoc = await getDoc(doc(grammarCollection, grade));

    if (gradeDoc.exists()) {
      const gradeData = gradeDoc.data();

      if (gradeData.users) {
        // Return all user scores for the grade
        const userScores = Object.keys(gradeData.users).map((username) => ({
          username: username,
          grade: grade,
          vocabScore: gradeData.users[username].vocab,
          grammarScore: gradeData.users[username].grammar,
        }));
        res.json(userScores);
      } else {
        res
          .status(404)
          .json({ error: "No user scores found for the specified grade" });
      }
    } else {
      res.status(404).json({ error: "Grade not found" });
    }
  } catch (error) {
    console.error("Error fetching grade scores:", error);
    res.status(500).send("Error fetching grade scores");
  }
});

// Route to update or add user scores by adding/subtracting from the current scores
router.post("/post/updateUserScores", async (req, res) => {
  try {
    // Fetch the API key from the request headers
    const userAPIKey = req.headers["x-api-key"];

    // Compare the fetched API key with the stored API key
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;
    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get the username, grade, vocabChange, and grammarChange from the request body
    const { username, grade, vocabChange, grammarChange } = req.body;

    if (
      !username ||
      !grade ||
      vocabChange === undefined ||
      grammarChange === undefined
    ) {
      return res.status(400).json({
        error:
          "Username, grade, vocabChange, and grammarChange are required in the request body",
      });
    }

    // Reference to the Firestore collection for the given grade
    const grammarCollection = collection(firestore, "Leaderboard");

    // Check if the user exists in the specified grade
    const gradeDoc = await getDoc(doc(grammarCollection, grade));

    if (gradeDoc.exists()) {
      const gradeData = gradeDoc.data();

      if (!gradeData.users) {
        gradeData.users = {};
      }

      // Check if the user already exists in the grade
      if (gradeData.users[username]) {
        // Add the changes to the user's scores
        gradeData.users[username].vocab += vocabChange;
        gradeData.users[username].grammar += grammarChange;

        // Ensure scores don't go below 0
        if (gradeData.users[username].vocab < 0) {
          gradeData.users[username].vocab = 0;
        }
        if (gradeData.users[username].grammar < 0) {
          gradeData.users[username].grammar = 0;
        }
      } else {
        // Add a new user entry with the changes as initial scores
        gradeData.users[username] = {
          vocab: vocabChange,
          grammar: grammarChange,
        };
      }

      // Update the Firestore document with the modified data
      await setDoc(doc(grammarCollection, grade), gradeData);
      res.json({ message: "User scores updated" });
    } else {
      res.status(404).json({ error: "Grade not found" });
    }
  } catch (error) {
    console.error("Error updating user scores:", error);
    res.status(500).send("Error updating user scores");
  }
});

export default router;
