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
      res.json(gradeData);
    } else {
      res.status(404).json({ error: "Grade not found" });
    }
  } catch (error) {
    console.error("Error fetching grade:", error);
    res.status(500).send("Error fetching grade");
  }
});

export default router;
