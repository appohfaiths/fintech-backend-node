import jwt, { Secret} from "jsonwebtoken"

export const generateToken = (id: string, username: string) => {
    return jwt.sign({ id, username}, process.env.JWT_SECRET as Secret, {
        expiresIn: '2d'
    })
}