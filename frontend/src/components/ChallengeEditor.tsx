import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Challenge {
  title: string;
  description: string;
  language: string;
  initialCode: string;
  testCases: TestCase[];
  timeLimit: number;
}

const ChallengeEditor: React.FC = () => {
  const { roundId } = useParams<{ roundId: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Fetch challenge data
    const fetchChallenge = async () => {
      try {
        const response = await axios.get(`/api/challenges/round/${roundId}`);
        setChallenge(response.data);
        setCode(response.data.initialCode);
        setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
      } catch (error) {
        console.error('Error fetching challenge:', error);
      }
    };
    fetchChallenge();
  }, [roundId]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmit(); // Auto-submit when time runs out
    }
  }, [timeLeft]);

  const handleCodeChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post('/api/submissions/run', {
        code,
        language: challenge?.language,
        roundId
      });
      setOutput(response.data.output);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error running code');
    }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/api/submissions/submit', {
        code,
        roundId,
        timeLeft
      });
      // Redirect to dashboard or next round
    } catch (error) {
      console.error('Error submitting code:', error);
    }
  };

  if (!challenge) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{challenge.title}</h1>
        <div className="text-xl">
          Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="mb-4">{challenge.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="h-[600px]">
          <Editor
            height="100%"
            defaultLanguage={challenge.language.toLowerCase()}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
            }}
          />
        </div>

        <div className="bg-gray-900 text-white p-4 rounded-lg h-[600px] overflow-auto">
          <h2 className="text-xl mb-2">Output</h2>
          <pre className="font-mono">{output || 'Run your code to see output'}</pre>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ChallengeEditor;
