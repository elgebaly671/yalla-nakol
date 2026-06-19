import { Router } from "express";
import {
    getSessions,
    createSession,
    getSession,
    checkInSession,
    joinSession,
    leaveSession,
    RequestJoinSession,
    getSessionItems,
    getSessionUsers,
    checkWaitingAccept,
    getSessionQueue,
    acceptRequest,
    rejectRequest,
    acceptAllRequests,
    addItem,
    getItemContributors,
    deleteItem,
    calculateSessionTotal
} from "../controllers/sessionController.js";

const sessionRouter = Router();

sessionRouter.get("/get-sessions", getSessions);
sessionRouter.post("/create-session", createSession);
sessionRouter.get("/get-session", getSession);
sessionRouter.post("/check-in-session", checkInSession);
sessionRouter.post("/join-session", joinSession);
sessionRouter.post("/leave-session", leaveSession);
sessionRouter.post("/request-join", RequestJoinSession);
sessionRouter.get("/get-session-items", getSessionItems);
sessionRouter.get("/get-session-users", getSessionUsers);
sessionRouter.post("/check-waiting-accept", checkWaitingAccept);
sessionRouter.get("/get-session-queue", getSessionQueue);
sessionRouter.post("/accept-request", acceptRequest);
sessionRouter.post("/reject-request", rejectRequest);
sessionRouter.post("/accept-all-requests", acceptAllRequests);
sessionRouter.post("/add-item", addItem);
sessionRouter.get("/get-item-contributors/:itemId", getItemContributors);
sessionRouter.post("/delete-item", deleteItem);
sessionRouter.get("/calculate-total/:sessionId", calculateSessionTotal);
// sessionRouter.post("/reject-all-requests", rejectAllRequests);
export default sessionRouter;