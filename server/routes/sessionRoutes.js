import { Router } from "express";
import { getSessions, createSession, getSession, checkInSession, joinSession, leaveSession, getSessionItems, getSessionUsers } from "../controllers/sessionController.js";

const sessionRouter = Router();

sessionRouter.get("/get-sessions", getSessions);
sessionRouter.post("/create-session", createSession);
sessionRouter.get("/get-session", getSession);
sessionRouter.post("/check-in-session", checkInSession);
sessionRouter.post("/join-session", joinSession);
sessionRouter.post("/leave-session", leaveSession);
sessionRouter.get("/get-session-items", getSessionItems);
sessionRouter.get("/get-session-users", getSessionUsers);
export default sessionRouter;