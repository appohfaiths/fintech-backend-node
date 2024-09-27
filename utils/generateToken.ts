import jwt, { Secret} from "jsonwebtoken"

export const generateBearerToken = (id: string, username: string) => {
    return jwt.sign({ id, username}, process.env.JWT_SECRET as Secret, {
        expiresIn: '2d'
    })
}

export const generateEmailVerificationToken = (id: string) => {
    return jwt.sign({ id}, process.env.JWT_SECRET as Secret, {
        expiresIn: '10m'
    })
}