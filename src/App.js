import './App.css';
import { useState, createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Content from './Components/content';
import Details from './Components/Details';
import HdrBar from './Components/hdrBar';



function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = (x) => {
    setIsDarkMode(x);
  };
  const DarkModeContext = createContext(isDarkMode);
  return (
    <DarkModeContext.Provider value={isDarkMode}>
      <HdrBar fun={(a)=>{toggleDarkMode(a)}} valIsDarkMode={isDarkMode} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Content valIsDarkMode={isDarkMode} />} />
          <Route path=':Name' element={<Details valIsDarkMode={isDarkMode} />} />
        </Routes>
      </BrowserRouter>
    </DarkModeContext.Provider>
  );
}

export default App;