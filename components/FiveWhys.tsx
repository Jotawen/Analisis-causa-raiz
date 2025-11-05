import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { generateFiveWhysAnalysis } from '../services/geminiService';
import GeminiResult from './GeminiResult';
import { SparklesIcon, ResetIcon } from './icons';

interface FiveWhysProps {
  problem: string;
}

const FiveWhys: React.FC<FiveWhysProps> = ({ problem }) => {
  const [geminiAnalysis, setGeminiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset analysis if the problem changes
  useEffect(() => {
    handleReset();
  }, [problem]);
  
  const handleReset = useCallback(() => {
    setGeminiAnalysis('');
    setError(null);
    setIsLoading(false);
  }, []);

  const isFormComplete = useMemo(() => {
    return problem.trim() !== '';
  }, [problem]);

  const handleAnalyze = async () => {
    if (!isFormComplete) return;

    setIsLoading(true);
    setError(null);
    setGeminiAnalysis('');

    try {
      const analysis = await generateFiveWhysAnalysis(problem);
      setGeminiAnalysis(analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido. Revisa la consola para más detalles.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-lg font-semibold text-cyan-400">2. Genere el Análisis Completo</h2>
        <p className="text-gray-400 mt-1">
          Una vez definido el problema, la IA puede generar automáticamente la cadena de los "5 Porqués", identificar la causa raíz y proponer un plan de acción.
        </p>
      </div>
      
      <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-end gap-4">
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
                {isLoading ? 'Analizando...' : 'Generar Análisis con IA'}
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
