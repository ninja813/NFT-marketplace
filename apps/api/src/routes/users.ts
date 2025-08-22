import { Router } from 'express';
import { User } from '../models/User';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

const PatchMeSchema = z.object({
  bio: z.string().max(1000).optional(),
  username: z.string().min(3).max(30).optional(),
});

router.patch('/me', requireAuth, async (req: any, res) => {
  try {
    const { bio, username } = PatchMeSchema.parse(req.body ?? {});

    const $set: Record<string, unknown> = {};
    if (bio !== undefined) $set.bio = bio;
    if (username !== undefined) $set.username = username;

    if (Object.keys($set).length === 0) {
      return res.status(400).json({ error: 'No changes provided.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set },
      { new: true, runValidators: true, context: 'query' }
    ).select('-passwordHash');

    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json(updated);
  } catch (err: any) {
    if (err?.code === 11000) {
      const key = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(409).json({ error: `${key} already in use.` });
    }
    if (err?.name === 'ZodError') {
      return res
        .status(400)
        .json({ error: 'Invalid input.', details: err.issues });
    }
    console.error('PATCH /users/me failed:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
