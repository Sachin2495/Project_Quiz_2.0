import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface RoundInfo {
  round: number;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
  score: number;
}

const Dashboard: React.FC = () => {
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
  const [userStats, setUserStats] = useState({
    totalScore: 0,
    currentRound: 1,
    username: ''
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [roundsRes, statsRes] = await Promise.all([
          axios.get('/api/challenges/rounds'),
          axios.get('/api/auth/stats')
        ]);
        setRounds(roundsRes.data);
        setUserStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Welcome, {userStats.username}!</h1>
        <div className="text-lg">
          Total Score: <span className="font-semibold">{userStats.totalScore}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {rounds.map((round) => (
          <div
            key={round.round}
            className={`bg-white p-6 rounded-lg shadow ${
              round.status === 'locked' ? 'opacity-50' : ''
            }`}
          >
            <h2 className="text-xl font-bold mb-2">Round {round.round}</h2>
            <h3 className="text-lg mb-2">{round.title}</h3>
            <p className="mb-4 text-gray-600">{round.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Score: <span className="font-semibold">{round.score}</span>
              </div>
              
              {round.status === 'available' && (
                <Link
                  to={`/challenge/${round.round}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Start Round
                </Link>
              )}
              
              {round.status === 'completed' && (
                <span className="text-green-500">✓ Completed</span>
              )}
              
              {round.status === 'locked' && (
                <span className="text-gray-500">🔒 Locked</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Instructions</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Complete each round in sequence to unlock the next challenge</li>
          <li>Round 1: Fix syntax errors in the given code</li>
          <li>Round 2: Debug logical errors and make the code work correctly</li>
          <li>Round 3: Optimize the working code for better performance</li>
          <li>Your score is based on accuracy, efficiency, and time taken</li>
          <li>Each round has a time limit - submit before time runs out!</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
