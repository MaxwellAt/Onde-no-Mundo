import { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Content from './Components/content';
import Details from './Components/Details';
import HdrBar from './Components/hdrBar';
import "./App.scss";


function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = (x) => {
    setIsDarkMode(x);
  };
  return (
    <HashRouter>
      <HdrBar fun={(a)=>{toggleDarkMode(a)}} valIsDarkMode={isDarkMode} />
      <Routes>
        <Route path="/" element={<Content valIsDarkMode={isDarkMode} />} />
        <Route path='/:Name' element={<Details valIsDarkMode={isDarkMode} />} />
      </Routes>
    </HashRouter>
  );
}

export default App;