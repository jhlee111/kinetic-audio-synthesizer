
import React from 'react';
import HandSynthesizer from './components/HandSynthesizer';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-black text-gray-200 font-sans">
      <HandSynthesizer />
    </div>
  );
};

export default App;