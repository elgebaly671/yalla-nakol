
import InSession from "../models/InSession.js";
import Session from "../models/sessionModel.js";
import RequestJoin from "../models/RequestJoin.js";
import Items from "../models/Items.js";
import ItemSharing from "../models/ItemSharing.js";

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
            return res.status(400).json({
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
        if (inSession) {
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
        const { userId, sessionId, userName } = req.body;
        console.log(userId, sessionId, userName)
        if (!userId || !sessionId || !userName) {
            return res.json({
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
        const { userId, sessionId } = req.body;
        if (!userId || !sessionId) {
            return res.json({
                success: false,
                message: "userId or sessionId is required"
            })
        }
        const inSession = await InSession.findOne({
            where: {
                userId, sessionId
            }
        })
        if (!inSession) {
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

export const getSessionItems = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.json({
                success: false,
                message: "sessionId is required"
            })
        }
        const items = await Items.findAll({
            where: {
                sessionId
            }
        })
        res.json({
            success: true,
            items
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const getSessionUsers = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.json({
                success: false,
                message: "sessionId is required"
            })
        }
        const users = await InSession.findAll({
            where: {
                sessionId
            }
        })
        res.json({
            success: true,
            users
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const RequestJoinSession = async (req,res) => {
    try{
        const {userId, sessionId, userName} = req.body;
        console.log(userId, sessionId, userName)
        if(!userId || !sessionId || !userName){
            return res.json({
                success: false,
                message: "userId or sessionId or userName is required"
            })
        }
        const inSession = await InSession.findOne({
            where: {
                userId, sessionId
            }
        })
        if (inSession) {
            return res.json({
                success: false,
                message: "You are already in this session"
            })
        }
        const requestJoinExists  = await RequestJoin.findOne({
            where: {
                userId, sessionId
            }
        })
        if (requestJoinExists) {
            return res.json({
                success: false,
                message: "You have already requested to join this session"
            })
        }
        const usernameTaken = await InSession.findOne({
            where: {
                sessionId, userName
            }
        })
        if (usernameTaken) {
            return res.json({
                success: false,
                message: "Username is already taken in this session"
            })
        }
        const requestJoin = await RequestJoin.create({
            userId, sessionId, userName
        })
        res.json({
            success: true,
            requestJoin
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const checkWaitingAccept = async (req, res) => {
    try {
        const { userId, sessionId } = req.body;
        if (!userId || !sessionId) {
            return res.json({
                success: false,
                message: "userId or sessionId is required"
            })
        }
        const requestJoin = await RequestJoin.findOne({
            where: {
                userId, sessionId
            }
        })
        if (requestJoin) {
            return res.json({
                success: true,
                waitingAccept: true
            })
        }
        res.json({
            success: true,
            waitingAccept: false
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const getSessionQueue = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.json({
                success: false,
                message: "sessionId is required"
            })
        }
        const queue = await RequestJoin.findAll({
            where: {
                sessionId
            }
        })
        res.json({
            success: true,
            queue
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const acceptRequest = async (req, res) => {
    try {
        const { userId, sessionId } = req.body;
        if (!userId || !sessionId) {
            return res.json({
                success: false,
                message: "userId or sessionId is required"
            })
        }
        const requestJoin = await RequestJoin.findOne({
            where: {
                userId, sessionId
            }
        })
        if (!requestJoin) {
            return res.json({
                success: false,
                message: "Request not found"
            })
        }
        const inSession = await InSession.create({
            userId, sessionId, userName: requestJoin.userName
        })
        await requestJoin.destroy();
        res.json({
            success: true,
            inSession
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const rejectRequest = async (req, res) => {
    try {
        const { userId, sessionId } = req.body;
        if (!userId || !sessionId) {
            return res.json({
                success: false,
                message: "userId or sessionId is required"
            })
        }
        const requestJoin = await RequestJoin.findOne({
            where: {
                userId, sessionId
            }
        })
        if (!requestJoin) {
            return res.json({
                success: false,
                message: "Request not found"
            })
        }
        await requestJoin.destroy();
        res.json({
            success: true,
            message: "Request rejected successfully"
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const acceptAllRequests = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.json({
                success: false,
                message: "sessionId is required"
            })
        }
        const requests = await RequestJoin.findAll({
            where: {
                sessionId
            }
        })
        if (!requests) {
            return res.json({
                success: false,
                message: "No requests found"
            })
        }
        requests.forEach(async (request) => {
            await InSession.create({
                userId: request.userId, sessionId, userName: request.userName
            })
            await request.destroy();
        })
        res.json({
            success: true,
            message: "All requests accepted successfully"
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const addItem = async (req, res) => {
    try {
        const { userId, sessionId, name, price, quantity, sharedWith } = req.body;
        console.log(req.body)
        if (!userId || !sessionId || !name || !price || !quantity) {

            return res.json({
                success: false,
                message: "Missing required fields"
            })
        }
        const item = await Items.create({
            name, price, quantity, userId, sessionId
        })
        if (sharedWith && sharedWith.length > 0) {
            const sharingRecords = sharedWith.map((sharedUserId) => ({
                itemId: item.id,
                userId: sharedUserId,
                sessionId
            }))
            await ItemSharing.bulkCreate(sharingRecords)
        }
        res.json({
            success: true,
            item
        })
    } catch (error) {
        console.log("error occurred",error)

        res.json({
            success: false,
            message: error.message
        })
    }
}

export const getItemContributors = async (req, res)=>{
    try{
        const {itemId} = req.params;
        if(!itemId){
            return res.json({
                success: false,
                message: "itemId is required"
            })
        }
        const contributors = await ItemSharing.findAll({
            where: {
                itemId
            }
        })

        const users = await InSession.findAll({
            where: {
                userId: contributors.map((contributor) => contributor.userId)
            }
        })
        res.json({
            success: true,
            users
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        if (!itemId) {
            return res.json({
                success: false,
                message: "itemId is required"
            })
        }
        const item = await Items.destroy({
            where: {
                id: itemId
            }
        })
        res.json({
            success: true,
            message: "Item deleted successfully"
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}