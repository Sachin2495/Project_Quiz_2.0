import express from 'express';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import { isAdmin, auth } from '../middleware/auth.js';

const router = express.Router();

// Get all challenges (admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get challenge for specific round
router.get('/round/:roundId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const roundId = parseInt(req.params.roundId);

    // Check if user has access to this round
    if (roundId > user.currentRound) {
      return res.status(403).json({ message: 'Round not unlocked yet' });
    }

    const challenge = await Challenge.findOne({ round: roundId });
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get round information for dashboard
router.get('/rounds', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const challenges = await Challenge.find({}, 'round title description');
    
    const roundsInfo = challenges.map(challenge => ({
      round: challenge.round,
      title: challenge.title,
      description: challenge.description,
      status: 
        user.currentRound > challenge.round ? 'completed' :
        user.currentRound === challenge.round ? 'available' : 'locked',
      score: user.scores[`round${challenge.round}`] || 0
    }));

    res.json(roundsInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new challenge (admin only)
router.post('/', [auth, isAdmin], async (req, res) => {
  try {
    const challenge = new Challenge(req.body);
    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update challenge (admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete challenge (admin only)
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
