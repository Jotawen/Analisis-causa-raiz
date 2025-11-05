import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { analyzeRootCause } from '../services/geminiService';
import WhyInput from './WhyInput';
import GeminiResult from './GeminiResult';
import { SparklesIcon, ResetIcon } from './icons';

interface Why {
  id: number;
  answer: string;
}

interface FiveWhysProps {
  problem: string;
}

const initialWhys: Why[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  answer: '',
}));

const FiveWhys: React.FC<FiveWhysProps> = ({ problem }) => {
  const [whys, setWhys] = useState<Why[]>(initialWhys);
  const [geminiAnalysis, setGeminiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset whys if the problem changes
    handleReset();
  }, [problem]);

  const handleWhyChange = (id: number, value: string) => {
    setWhys(prevWhys =>
      prevWhys.map(why => (why.id === id ? { ...why, answer: value } : why))
    );
  };

  const handleReset = useCallback(() => {
    setWhys(initialWhys);
    setGeminiAnalysis('');
    setError(null);
    setIsLoading(false);
  }, []);

  const isFormComplete = useMemo(() => {
    return problem.trim() !== '' && whys.every(why => why.answer.trim() !== '');
  }, [problem, whys]);

  const handleAnalyze = async () => {
    if (!isFormComplete) return;

    setIsLoading(true);
    setError(null);
    setGeminiAnalysis('');

    try {
      const analysis = await analyzeRootCause(problem, whys);
      setGeminiAnalysis(analysis);
    } catch (err) {
      setError('Ocurrió un error al contactar con la IA. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-cyan-400">2. Pregunte "Por Qué" 5 veces</h2>
        {whys.map((why, index) => (
          <WhyInput
            key={why.id}
            id={why.id}
            question={`¿Por qué ${index > 0 ? 'ocurrió eso' : 'ocurrió el problema'}?`}
            answer={why.answer}
            onChange={(value) => handleWhyChange(why.id, value)}
            placeholder={`Respuesta ${why.id}...`}
            previousAnswer={index > 0 ? whys[index-1].answer : problem}
          />
        ))}
      </div>
      
      <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
              <p className="text-lg font-semibold text-cyan-400">3. Causa Raíz Identificada</p>
              <p className="text-gray-300 bg-gray-900/50 p-3 rounded-md min-h-[48px]">
                  {whys[4].answer.trim() || <span className="text-gray-500">La respuesta al 5º porqué aparecerá aquí.</span>}
              </p>
          </div>
           <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gray-600 hover:bg-gray-500 rounded-md font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
              >
                  <ResetIcon className="h-5 w-5" />
                  Limpiar
              </button>
              <button
                  onClick={handleAnalyze}
                  disabled={!isFormComplete || isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
              >
                  <SparklesIcon className="h-5 w-5"/>
                  {isLoading ? 'Analizando...' : 'Analizar con IA'}
              </button>
          </div>
      </div>

      {(isLoading || geminiAnalysis || error) && (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 text-center">Análisis de la IA</h2>
            <GeminiResult analysis={geminiAnalysis} isLoading={isLoading} error={error} />
        </div>
      )}
    </div>
  );
};

export default FiveWhys;
