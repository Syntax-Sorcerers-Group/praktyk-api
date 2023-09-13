import express from "express";
import PicScout from "picscout";

const router = express.Router();

router.post("/get/image", async (req, res) => {
  try {
    // Fetch the API key from the request headers
    const userAPIKey = req.headers["x-api-key"];

    // Compare the fetched API key with the stored API key
    const storedAPIKey = process.env.REACT_APP_PRAKTYK_API_KEY;
    if (userAPIKey !== storedAPIKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get image name from the request body
    const { imageName } = req.body;

    if (!imageName) {
      return res
        .status(400)
        .json({ error: "Image name is required in the request body" });
    }

    // Append "cartoon" to the image name
    const modifiedImageName = imageName + "cartoon";

    // Search for the image using PicScout with safe property
    const picScoutResponse = await PicScout.search(modifiedImageName, {
      safe: true,
    });

    // Check if the search was successful
    if (Array.isArray(picScoutResponse) && picScoutResponse.length > 0) {
      const imageData = picScoutResponse[0]; // Assuming the first result contains the image data
      res.json(imageData);
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Error fetching image");
  }
});

export default router;
