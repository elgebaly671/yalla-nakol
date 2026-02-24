import express from "express";
import { sequelize } from "./config/database.js";
import Session from "./models/sessionModel.js";
import InSession from "./models/InSession.js";
import Items from "./models/Items.js";
import userRouter from "./routes/userRoutes.js";
import sessionRouter from "./routes/sessionRoutes.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use("/api/user", userRouter);
app.use("/api/sessions", sessionRouter);
app.get('/', (req, res) => {
    res.send("Hello");
});

app.listen(3000, async () => {
    console.log("Server is running on port 3000");
    try {
        await sequelize.authenticate();
        console.log("Database connection established");
        await sequelize.sync({ alter: true });
        console.log("Database synced - tables created/updated");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
});