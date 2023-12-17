import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import UsersService from "../services/users.js";

export async function generateJwtToken(userId) {
    try {
        const user = await UsersService.getUserById(userId);
        const jwt_payload = UsersService.getUserPublicData(user);
        const options = { expiresIn: '1h' };
        const token = jwt.sign(jwt_payload, config.auth.jwtSecret, options);
        return token;
    } catch (error) {
        log(error)
    }
}

export default generateJwtToken;
