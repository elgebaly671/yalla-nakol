import express from "express";
import { sequelize } from "./config/database.js";
import Session from "./models/sessionModel.js";
import InSession from "./models/InSession.js";
import Items from "./models/Items.js";
import userRouter from "./routes/userRoutes.js";
import sessionRouter from "./routes/sessionRoutes.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});
app.use("/api/user", userRouter);
app.use("/api/sessions", sessionRouter);
app.get('/', (req, res) => {
    res.send("Hello");
});
io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);
    socket.on('join_room', (data)=>{
        socket.join(data)
    })
    socket.on('Joined_Session', (data) => {
        socket.to(data.sessionId).emit('recieve_join', data)
    })
    socket.on('leave_session', (data) =>{
        socket.to(data.sessionId).emit('recieve_leave')
    })
})
server.listen(3000, async () => {
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