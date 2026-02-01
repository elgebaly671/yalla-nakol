import { v4 as uuidv4 } from 'uuid';

export const createUser = async (req, res) => {
    try {
        const userId = uuidv4();
        res.json({
            success: true,
            userId
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create user"
        })
    }
}