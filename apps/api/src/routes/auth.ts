import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';
import { randomBytes } from 'crypto';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function signJWT(id: string) {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

router.post('/register', async (req, res) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const exists = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });
    if (exists)
      return res
        .status(400)
        .json({ error: 'Email or username already in use' });

    const hash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      email: data.email,
      username: data.username,
      passwordHash: hash,
      avatarSeed: data.username,
      balance: 250,
    });

    const token = signJWT(user._id.toString());
    res
      .cookie(config.cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProd,
      })
      .json({
        id: user._id,
        email: user.email,
        username: user.username,
        balance: user.balance,
        walletAddress: user.walletAddress,
        bio: user.bio,
      });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Invalid input' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = LoginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = signJWT(user._id.toString());
    res
      .cookie(config.cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProd,
      })
      .json({
        id: user._id,
        email: user.email,
        username: user.username,
        balance: user.balance,
        walletAddress: user.walletAddress,
        bio: user.bio,
      });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Invalid input' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(config.cookieName).json({ ok: true });
});

router.get('/me', requireAuth, async (req: any, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    id: user!._id,
    email: user!.email,
    username: user!.username,
    balance: user!.balance,
    bio: user!.bio,
    walletAddress: user!.walletAddress,
  });
});

router.get('/nonce', async (req, res) => {
  const address = String(req.query.address || '').toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(address))
    return res.status(400).json({ error: 'Invalid address' });

  const nonce = randomBytes(16).toString('hex');
  const user =
    (await User.findOneAndUpdate(
      { walletAddress: address },
      { $set: { loginNonce: nonce } },
      { new: true }
    )) ||
    (await User.create({
      email: `${address}@wallet.local`,
      username: `user_${address.slice(2, 8)}`,
      passwordHash: await bcrypt.hash(randomBytes(16).toString('hex'), 10),
      balance: 200,
      walletAddress: address,
      loginNonce: nonce,
      avatarSeed: address,
    }));

  const domain = req.headers.host || 'localhost';
  const uri = `${req.protocol}://${req.get('host')}`;
  const statement = 'Sign in to Spectra Market';

  const message = [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    '',
    statement,
    '',
    `URI: ${uri}`,
    `Version: 1`,
    `Chain ID: 1`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join('\n');

  res.json({ nonce, statement, domain, uri, message });
});

router.post('/wallet', async (req, res) => {
  try {
    const address = String(req.body.address || '').toLowerCase();
    const signature = String(req.body.signature || '');

    if (!/^0x[a-f0-9]{40}$/.test(address))
      return res.status(400).json({ error: 'Invalid address' });
    if (!/^0x[0-9a-fA-F]+$/.test(signature))
      return res.status(400).json({ error: 'Invalid signature' });

    const user = await User.findOne({ walletAddress: address });
    if (!user || !user.loginNonce)
      return res.status(400).json({ error: 'No nonce for address' });

    const domain = req.headers.host || 'localhost';
    const uri = `${req.protocol}://${req.get('host')}`;
    const message = [
      `${domain} wants you to sign in with your Ethereum account:`,
      address,
      '',
      'Sign in to Spectra Market',
      '',
      `URI: ${uri}`,
      `Version: 1`,
      `Chain ID: 1`,
      `Nonce: ${user.loginNonce}`,
      `Issued At: ${new Date().toISOString()}`,
    ].join('\n');

    user.loginNonce = undefined;
    await user.save();

    const token = signJWT(user._id.toString());
    res
      .cookie(config.cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProd,
      })
      .json({
        id: user._id,
        email: user.email,
        username: user.username,
        balance: user.balance,
        walletAddress: user.walletAddress,
        bio: user.bio,
      });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Wallet login failed' });
  }
});

export default router;
