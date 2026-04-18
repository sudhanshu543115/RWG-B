import User from "../models/tourist/User.js";

export const protectTourist = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized. Please login." });
        }
        
        const token = authHeader.split(" ")[1];
        
        if (token.startsWith("mock_token_")) {
            const userId = token.replace("mock_token_", "");
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            
            req.user = user;
            return next();
        }

        return res.status(401).json({ success: false, message: "Invalid token format." });

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ success: false, message: "Not authorized. Token failed." });
    }
};
