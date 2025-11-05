import React from 'react';

interface GeminiResultProps {
  analysis: string;
  isLoading: boolean;
  error: string | null;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mt-6"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
);

// Simple component to render basic markdown-like text from Gemini
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const elements = text.split('\n').map((line, index) => {
    if (line.trim() === '') {
      return <br key={index} />;
    }

    // Match headings (e.g., **Title**)
    if (/^\*\*(.*?)\*\*$/.test(line.trim())) {
      return (
        <h3 key={index} className="text-lg font-semibold text-cyan-400 mt-4 mb-2">
          {line.replace(/\*\*/g, '')}
        </h3>
      );
    }
    
    // Match numbered list items
    if (/^\d+\.\s/.test(line.trim())) {
        const lineContent = line.replace(/^\d+\.\s/, '');
        const parts = lineContent.split(/(\*\*.*?\*\*)/g).filter(part => part);
        return (
            <li key={index} className="ml-5 list-decimal">
                 {parts.map((part, i) => 
                    part.startsWith('**') && part.endsWith('**')
                        ? <strong key={i}>{part.slice(2, -2)}</strong>
                        : part
                )}
            </li>
        )
    }

    // Handle bold text within a paragraph
    const parts = line.split(/(\*\*.*?\*\*)/g).filter(part => part);
    return (
      <p key={index}>
        {parts.map((part, i) => 
            part.startsWith('**') && part.endsWith('**')
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : part
        )}
      </p>
    );
  });

  return <>{elements}</>;
};


const GeminiResult: React.FC<GeminiResultProps> = ({ analysis, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-200 rounded-xl shadow-lg p-6 text-center">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 prose prose-invert prose-p:text-gray-300 prose-headings:text-cyan-400 max-w-none">
      <div className="space-y-2">
        <SimpleMarkdown text={analysis} />
      </div>
    </div>
  );
};

export default GeminiResult;
