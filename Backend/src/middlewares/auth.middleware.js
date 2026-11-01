const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        });
    }

    try {
        const isTokenBlacklisted = await tokenBlackListModel.findOne({ token });
        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Token is invalid."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid Token."
        });
    }
}

module.exports = { authUser };
