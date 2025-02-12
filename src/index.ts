import express from "express";
import dotenv from 'dotenv'
dotenv.config();


const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "hello,World!",
  });
});

export default app;