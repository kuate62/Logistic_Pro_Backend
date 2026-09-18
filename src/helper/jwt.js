import jwt from "jsonwebtoken"

const secret = process.env.JWT_SECRET

export function generateToken(user) {
    return jwt.sign(user, secret, {expiresIn: '1h'})
}

export function verifyToken(token) {
    return jwt.verify(token, secret);
}
