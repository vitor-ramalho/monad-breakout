import { useState } from "react";

interface LevelSelectionPanelProps {
  onSelectLevel: (level: number) => void;
}

const LevelSelectionPanel: React.FC<LevelSelectionPanelProps> = ({ onSelectLevel }) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const handleLevelClick = (level: number) => {
    setSelectedLevel(level);
    onSelectLevel(level);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <h1 className="text-white text-2xl mt-4">Select Level</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[1, 2, 3, 4, 5].map(level => (
          <button
            key={level}
            onClick={() => handleLevelClick(level)}
            className={`px-4 py-2 rounded ${selectedLevel === level ? "bg-blue-500" : "bg-green-500"} text-white`}
          >
            Level {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelectionPanel;
