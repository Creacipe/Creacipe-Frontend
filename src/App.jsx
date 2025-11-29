// LOKASI: src/App.jsx (VERSI FINAL)

import React from 'react';
import AppRouter from './routes/AppRouter'; 
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  React.useEffect(() => {
    AOS.init();
  }, []);
  
  return (
    <AppRouter />
  );
}

export default App;