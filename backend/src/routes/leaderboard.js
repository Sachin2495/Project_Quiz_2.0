import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get global leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'username totalScore scores currentRound')
      .sort({ totalScore: -1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalScore: user.totalScore,
      roundScores: user.scores,
      currentRound: user.currentRound
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get round-specific leaderboard
router.get('/round/:roundId', auth, async (req, res) => {
  try {
    const roundId = parseInt(req.params.roundId);
    const scoreField = `scores.round${roundId}`;

    const users = await User.find(
      { [scoreField]: { $exists: true, $gt: 0 } },
      'username scores'
    )
      .sort({ [scoreField]: -1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      score: user.scores[`round${roundId}`] || 0
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
