import express from 'express';
import axios from 'axios';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Helper function to calculate score based on various factors
const calculateScore = (testsPassed, totalTests, timeLeft, originalTime, round) => {
  const accuracyScore = (testsPassed / totalTests) * 70;
  const timeScore = (timeLeft / originalTime) * 30;
  return Math.round(accuracyScore + timeScore);
};

// Run code without submitting
router.post('/run', auth, async (req, res) => {
  try {
    const { code, language } = req.body;

    // Using Judge0 API for code execution
    const response = await axios.post(process.env.JUDGE0_API_URL + '/submissions', {
      source_code: code,
      language_id: getLanguageId(language),
      stdin: '',
    }, {
      headers: {
        'X-RapidAPI-Host': process.env.JUDGE0_API_HOST,
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
      }
    });

    // Wait for execution to complete
    const result = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/${response.data.token}`,
      {
        headers: {
          'X-RapidAPI-Host': process.env.JUDGE0_API_HOST,
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        }
      }
    );

    res.json({
      output: result.data.stdout || result.data.stderr,
      status: result.data.status.description
    });
  } catch (error) {
    res.status(500).json({ message: 'Code execution failed' });
  }
});

// Submit solution for evaluation
router.post('/submit', auth, async (req, res) => {
  try {
    const { code, roundId, timeLeft } = req.body;
    const user = await User.findById(req.user.userId);
    const challenge = await Challenge.findOne({ round: roundId });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    let testsPassed = 0;
    const totalTests = challenge.testCases.length;

    // Run code against all test cases
    for (const testCase of challenge.testCases) {
      const response = await axios.post(process.env.JUDGE0_API_URL + '/submissions', {
        source_code: code,
        language_id: getLanguageId(challenge.language),
        stdin: testCase.input,
      }, {
        headers: {
          'X-RapidAPI-Host': process.env.JUDGE0_API_HOST,
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        }
      });

      const result = await axios.get(
        `${process.env.JUDGE0_API_URL}/submissions/${response.data.token}`,
        {
          headers: {
            'X-RapidAPI-Host': process.env.JUDGE0_API_HOST,
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          }
        }
      );

      if (result.data.stdout?.trim() === testCase.expectedOutput.trim()) {
        testsPassed++;
      }
    }

    // Calculate score
    const score = calculateScore(
      testsPassed,
      totalTests,
      timeLeft,
      challenge.timeLimit * 60,
      roundId
    );

    // Update user's score
    user.scores[`round${roundId}`] = score;
    user.totalScore = Object.values(user.scores).reduce((a, b) => a + b, 0);

    // If all tests passed, unlock next round
    if (testsPassed === totalTests && user.currentRound === parseInt(roundId)) {
      user.currentRound += 1;
    }

    await user.save();

    res.json({
      score,
      testsPassed,
      totalTests,
      nextRound: user.currentRound
    });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed' });
  }
});

// Helper function to get Judge0 language ID
const getLanguageId = (language) => {
  const languageMap = {
    'python': 71,    // Python 3.8
    'javascript': 63, // JavaScript Node.js
    'java': 62,      // Java 11.0.4
    'cpp': 54,       // C++ GCC 9.1.0
    'c': 50         // C GCC 9.1.0
  };
  return languageMap[language.toLowerCase()] || 71; // Default to Python
};

export default router;
