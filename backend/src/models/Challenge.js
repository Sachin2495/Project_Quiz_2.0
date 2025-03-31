import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
  initialCode: { type: String, required: true },
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  timeLimit: { type: Number, required: true }, // in minutes
  baselineExecutionTime: { type: Number }, // for round 3 optimization challenges
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  points: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Challenge', challengeSchema);
