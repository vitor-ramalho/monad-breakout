import { FC, useState } from "react";

interface LevelSelectionProps {
  onSelectLevel: (level: number) => void;
}

const levels = [
  { level: 1, completed: false },
  { level: 2, completed: false },
  { level: 3, completed: false },
  { level: 4, completed: false },
  { level: 5, completed: false },
  { level: 6, completed: false },
  { level: 7, completed: false },
  { level: 8, completed: false },
  { level: 9, completed: false },
  { level: 10, completed: false },
];

const LevelSelection: FC<LevelSelectionProps> = ({ onSelectLevel }) => {
  const [levelStatus, setLevelStatus] = useState(levels);

  const handleLevelSelect = (level: number) => {
    onSelectLevel(level);
    setLevelStatus(prevStatus => prevStatus.map(l => (l.level === level ? { ...l, completed: true } : l)));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <h1 className="text-white text-4xl mb-8 animate-pulse">Select Level</h1>
      <div className="grid grid-cols-3 gap-4">
        {levelStatus.map(({ level, completed }) => (
          <button
            key={level}
            className={`px-6 py-4 rounded-lg mb-4 text-white font-bold transform transition-transform duration-300 hover:scale-110 ${
              completed ? "bg-green-500" : "bg-blue-500"
            }`}
            onClick={() => handleLevelSelect(level)}
          >
            Level {level} {completed && "✓"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelection;
