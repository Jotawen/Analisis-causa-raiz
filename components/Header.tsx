
import React from 'react';
import { BrainCircuitIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-5 flex items-center justify-center space-x-4">
        <BrainCircuitIcon className="h-10 w-10 text-cyan-400" />
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Análisis de Causa Raíz con IA</h1>
            <p className="text-sm text-gray-400">Método de los 5 Porqués</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
