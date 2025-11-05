import React, { useState } from 'react';
import Header from './components/Header';
import FiveWhys from './components/FiveWhys';
import IshikawaDiagram from './components/IshikawaDiagram';
import { BrainCircuitIcon, FishboneIcon } from './components/icons';

type Tool = 'fiveWhys' | 'ishikawa';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('fiveWhys');
  const [problem, setProblem] = useState('');

  const renderTool = () => {
    switch (activeTool) {
      case 'fiveWhys':
        return <FiveWhys problem={problem} />;
      case 'ishikawa':
        return <IshikawaDiagram problem={problem} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 space-y-8">
          {/* Problem Definition */}
          <div>
            <label htmlFor="problem" className="block text-lg font-semibold text-cyan-400 mb-2">
              1. Defina el Problema Central
            </label>
            <textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Ej: Aumento del 15% en defectos de pegado en la línea de producción 3."
              className="w-full bg-gray-900 border-2 border-gray-700 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
              rows={2}
            />
          </div>

          {/* Tool Selector */}
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTool('fiveWhys')}
                className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTool === 'fiveWhys'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
              >
                <BrainCircuitIcon className="h-5 w-5" />
                5 Porqués
              </button>
              <button
                onClick={() => setActiveTool('ishikawa')}
                className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTool === 'ishikawa'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
              >
                <FishboneIcon className="h-5 w-5" />
                Diagrama de Ishikawa
              </button>
            </nav>
          </div>
          
          {/* Active Tool */}
          <div className="pt-4">
            {renderTool()}
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Desarrollado con React, Tailwind CSS y Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
