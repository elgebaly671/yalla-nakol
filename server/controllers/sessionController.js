
import InSession from "../models/InSession.js";
import Session from "../models/sessionModel.js";

export const getSessions = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log(userId);
        const sessions = await Session.findAll({
            where: {
                createdBy: userId
            }
        })
        res.json({
            success: true,
            sessions
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const createSession = async (req, res) => {
    try {
        const { userId, title } = req.body;
        if (!userId || !title) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            })
        }
        const session = await Session.create({
            createdBy: userId,
            title: title,
        })
        const sessionLink = `${process.env.FRONTEND_URL}/session/${session.id}`;
        await session.update({ sessionLink });
        res.json({
            success: true,
            session
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to create session"
        })
    }
}

export const getSession = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            })
        }
        const session = await Session.findOne({
            where: {
                id: sessionId
            }
        })
        res.json({
            success: true,
            session
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const checkInSession = async (req, res) => {
    try {
        const { userId, sessionId } = req.body;
        if (!userId || !sessionId) {
            res.status(500).json({
                success: false,
                message: "Missing userId or sessionId"
            })
        }
        const inSession = await InSession.findOne({
            where: {
                userId,
                sessionId
            }
        })
        if(inSession){
            return res.json({
                success: true,
                inSession: true
            })
        }
        res.json({
            success: true,
            inSession: false
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const joinSession = async (req, res) => {
    try {
        const{ userId, sessionId, userName} = req.body;
        console.log(userId, sessionId, userName)
        if(!userId || !sessionId || !userName){
            res.json({
                success: false,
                message: "required userId or sessionId"
            })
        }
        const inSession = await InSession.create({
            userId, sessionId, userName
        })
        res.json({
            success: true,
            inSession: true
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const leaveSession = async (req, res) => {
    try {
        const {userId, sessionId} = req.body;
        if(!userId || !sessionId){
            res.json({
                success: false,
                message: "userId or sessionId is required"
            })
        }
        const inSession = await InSession.findOne({
            where: {
                userId, sessionId
            }
        })
        if(!inSession){
            return res.json({
                success: false,
                message: "You are not in this session"
            })
        }
        await inSession.destroy();
        console.log("You left the session successfully")
        res.json({
            success: true,
            inSession: false
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}