import type { AuthUser } from "../utils/types.js"

declare global {
    namespace Express {
        interface Request {
            user: AuthUser
        }
    }
}

export {}
