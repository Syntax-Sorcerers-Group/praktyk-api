import express from 'express';
import rootRoute from './src/rootRoute';

const app: express.Application = express();
const port: number = 8080;

// Use the route files as middleware
app.use('/', rootRoute);

app.listen(port, () => {
  console.log(`TypeScript with Express: http://localhost:${port}/`);
});
