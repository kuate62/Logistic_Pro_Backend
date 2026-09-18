import { verifyToken } from "../helper/jwt.js"

function getRequestToken(req) {
    const authHeader = req.headers['authorization']

    if (!authHeader || typeof authHeader !== "string") return null

    const [bearer, token, ...others] = authHeader.split(' ')

    if (bearer.toLowerCase() !== 'bearer' || !token || others.length > 0) return null

    return token
}

function normalizeRoles(value) {
    if (Array.isArray(value)) return value
    if (typeof value === 'string') return value.split(',').map(r => r.trim()).filter(Boolean)
    return []
}

export async function authenticate(req, res, next)
{
    const token = getRequestToken(req)

    if (!token) return res.status(401).json('access denied')

    try {
        req.user = verifyToken(token)
        next()
    }
    catch (e) {
        return res.status(401).json('invalid token')
    }
}

export function isGrantedAccess(roles)
{
    return (req, res, next) => {

        if (!req.user) return res.status(401).json('UnAuthorized')

        const userRoles = normalizeRoles(req.user.roles)

        const granted = roles.some(role => userRoles.includes(role))

        if (!granted) return res.status(403).json('access denied')

        else next()
    }
}
