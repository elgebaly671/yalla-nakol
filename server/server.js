import express from "express";
import { sequelize } from "./config/database.js";
import Session from "./models/sessionModel.js";
import InSession from "./models/InSession.js";
import RequestJoin from "./models/RequestJoin.js";
import Items from "./models/Items.js";
import userRouter from "./routes/userRoutes.js";
import ItemSharing from "./models/ItemSharing.js";
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
    socket.on('request_join', (data) => {
        socket.to(data.sessionId).emit('recieve_request', data)
    })
    socket.on('accept_request', (data) => {
        socket.to(data.sessionId).emit('recieve_accept', data)
    })
    socket.on('reject_request', (data) => {
        socket.to(data.sessionId).emit('recieve_reject', data)
    })
    socket.on('accept_all_requests', (data) => {
        socket.to(data.sessionId).emit('recieve_accept_all', data)
    })
    socket.on('reject_all_requests', (data) => {
        socket.to(data.sessionId).emit('recieve_reject_all', data)
    })  
    socket.on('added_item', (data)=>{
        socket.to(data.sessionId).emit('recieve_item', data)
    })
    socket.on('deleted_item', (data)=>{
        socket.to(data.sessionId).emit('recieve_delete_item', data)
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