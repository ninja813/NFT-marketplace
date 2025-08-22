import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/User';

export interface AuthedRequest extends Request {
  user?: any;
}

export function authOptional(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.[config.cookieName];
    if (!token) return next();
    const payload = jwt.verify(token, config.jwtSecret) as any;
    req.user = payload;
  } catch (e) {}
  next();
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.[config.cookieName];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, config.jwtSecret) as any;
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
