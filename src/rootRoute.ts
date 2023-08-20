import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
  res.send("Sayf and Daggy were here!");
});

export default router;
