import type { UserRole } from "../models/User";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: UserRole;
      email: string;
      name: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
