import {TokenBlacklistService} from "../../Application/Services/Concrete/Redis/TokenBlacklistService.js";
import {JWTPayload} from "./JWTPayload.js";

// declare module 'fastify'{
//     interface FastifyRequest{
//         user?: JWTPayload;
//     }
// }

export const authenticateJWT = async (request: any, reply: any): Promise<void> => {
    try
    {
        let token = request.cookies.token;

        if (!token) {
            const authHeader = request.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                console.log('Token from header:', token);
            }
            else{
                console.log('Token from cookie:', token);
            }
        }

        if (!token) {
            console.log('No token found!');
            return reply.code(401).send({ message: 'Unauthorized: No token provided' });
        }

        if (await TokenBlacklistService.isTokenBlacklisted(token)) {
            return reply.code(401).send({ message: 'Unauthorized: Token has been revoked' });
        }

        request.user = request.server.jwt.verify(token);
    }
    catch (err: any)
    {
        if (err.name === 'TokenExpiredError')
        {
            const refreshToken = request.cookies.refreshToken;
            if (refreshToken)
            {
                return reply.code(401).send({
                    message: 'Access token expired',
                    code: 'TOKEN_EXPIRED',
                    hasRefreshToken: true,
                })
            }
        }
        console.error('JWT verification error:', err);
        reply.status(401).send({ message: 'Invalid token - AuthenticateJWT' });
    }
}