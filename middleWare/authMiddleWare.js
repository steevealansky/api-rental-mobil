export function verifyUser(allowedRoles) {
    return(req, res, next) => {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({success: false, message: "forbidden"})
        }
        try {
            const token = authHeader.split(" ")[1]
            const user = JSON.parse(Buffer.from(token,"base64").toString("ascii"))
            req.user = user 
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({success: false, message: "forbidden"})
            }
            next()
        } catch (error) {
            return res.status(401).json({success: false, message: "token tidak valid"})
        }
    }
}