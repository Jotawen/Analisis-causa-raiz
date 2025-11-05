
import React, { useState, useMemo } from 'react';
import { analyzeIshikawa, Category, Cause } from '../services/geminiService';
import GeminiResult from './GeminiResult';
import { SparklesIcon, PlusIcon, TrashIcon, ResetIcon } from './icons';

let categoryIdCounter = 6;
let causeIdCounter = 100;

const defaultCategories: Category[] = [
  { id: 1, name: 'Método' },
  { id: 2, name: 'Mano de Obra' },
  { id: 3, name: 'Materiales' },
  { id: 4, name: 'Maquinaria' },
  { id: 5, name: 'Medición' },
  { id: 6, name: 'Medio Ambiente' },
];

interface IshikawaDiagramProps {
  problem: string;
}

const IshikawaDiagram: React.FC<IshikawaDiagramProps> = ({ problem }) => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [causes, setCauses] = useState<Record<number, Cause[]>>({});
  const [geminiAnalysis, setGeminiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCategory = () => {
    categoryIdCounter++;
    const newCategory: Category = { id: categoryIdCounter, name: `Nueva Categoría ${categoryIdCounter - 6}` };
    setCategories([...categories, newCategory]);
  };

  const handleRemoveCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
    const newCauses = { ...causes };
    delete newCauses[id];
    setCauses(newCauses);
  };
  
  const handleCategoryNameChange = (id: number, newName: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name: newName } : c));
  };
  
  const handleAddCause = (catId: number) => {
    causeIdCounter++;
    const newCause: Cause = { id: causeIdCounter, text: '' };
    setCauses({
      ...causes,
      [catId]: [...(causes[catId] || []), newCause],
    });
  };

  const handleRemoveCause = (catId: number, causeId: number) => {
    setCauses({
      ...causes,
      [catId]: causes[catId].filter(c => c.id !== causeId),
    });
  };
  
  const handleCauseTextChange = (catId: number, causeId: number, text: string) => {
      setCauses({
          ...causes,
          [catId]: causes[catId].map(c => c.id === causeId ? { ...c, text } : c)
      });
  };

  const handleReset = () => {
    setCategories(defaultCategories);
    setCauses({});
    setGeminiAnalysis('');
    setError(null);
    setIsLoading(false);
  };
  
  const isFormComplete = useMemo(() => {
    if (problem.trim() === '') return false;
    const allCauses = Object.values(causes).flat();
    if (allCauses.length === 0) return false;
    return allCauses.every(c => c.text.trim() !== '');
  }, [problem, causes]);

  const handleAnalyze = async () => {
    if (!isFormComplete) return;

    setIsLoading(true);
    setError(null);
    setGeminiAnalysis('');

    try {
      const analysis = await analyzeIshikawa(problem, categories, causes);
      setGeminiAnalysis(analysis);
    } catch (err) {
      setError('Ocurrió un error al contactar con la IA. Por favor, inténtalo de nuevo.');
      // FIX: Add type checking for the caught error to safely handle and log it.
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred', err);
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-4">2. Lluvia de Ideas de Causas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <input 
                    type="text"
                    value={category.name}
                    onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                    className="font-bold text-cyan-500 bg-transparent focus:outline-none focus:bg-gray-800 rounded px-1 -ml-1"
                />
                <button onClick={() => handleRemoveCategory(category.id)} className="text-gray-500 hover:text-red-400">
                    <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {(causes[category.id] || []).map((cause, index) => (
                    <div key={cause.id} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={`Causa ${index + 1}...`}
                            value={cause.text}
                            onChange={(e) => handleCauseTextChange(category.id, cause.id, e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-1.5 text-sm text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                        />
                         <button onClick={() => handleRemoveCause(category.id, cause.id)} className="text-gray-500 hover:text-red-400 shrink-0">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button onClick={() => handleAddCause(category.id)} className="w-full flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 bg-gray-700/50 hover:bg-gray-700/80 p-1.5 rounded-md transition-colors duration-200">
                    <PlusIcon className="w-4 h-4" />
                    Añadir Causa
                </button>
              </div>
            </div>
          ))}
          <button onClick={handleAddCategory} className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-transparent border-2 border-dashed border-gray-600 hover:border-cyan-500 hover:bg-gray-800/50 p-4 rounded-lg transition-colors duration-200">
            <PlusIcon className="w-5 h-5" />
            Añadir Categoría
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-end gap-4">
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
            {isLoading ? 'Generando Plan...' : 'Generar Plan de Mejora'}
        </button>
      </div>

      {(isLoading || geminiAnalysis || error) && (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 text-center">Plan de Mejora (IA)</h2>
            <GeminiResult analysis={geminiAnalysis} isLoading={isLoading} error={error} />
        </div>
      )}
    </div>
  );
};

export default IshikawaDiagram;
