
import React from 'react';

interface WhyInputProps {
  id: number;
  question: string;
  answer: string;
  onChange: (value: string) => void;
  placeholder: string;
  previousAnswer: string;
}

const WhyInput: React.FC<WhyInputProps> = ({ id, question, answer, onChange, placeholder, previousAnswer }) => {
  const isDisabled = !previousAnswer.trim();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
      <label htmlFor={`why-${id}`} className="w-full md:w-1/3 text-gray-300 font-medium shrink-0">
        <span className="font-bold text-cyan-500">{id}.</span> {question}
      </label>
      <textarea
        id={`why-${id}`}
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isDisabled}
        className="w-full bg-gray-700/50 border-2 border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 resize-none"
        rows={1}
      />
    </div>
  );
};

export default WhyInput;
