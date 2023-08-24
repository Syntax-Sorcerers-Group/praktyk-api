import express from "express";
import rootRoute from "./src/rootRoute";
import userRoute from "./src/userRoute";
import imageRoute from "./src/imageRoute";
import vocabRoute from "./src/vocabRoute";
import grammarRoute from "./src/grammarRoute";

const app: express.Application = express();
const port: number = 8080;

// Use the route files as middleware
app.use("/", rootRoute);
app.use("/api", userRoute);
app.use("/api", imageRoute);
app.use("/api", vocabRoute);
app.use("/api", grammarRoute);

app.listen(port, () => {
  console.log(`TypeScript with Express: http://localhost:${port}/`);
});
