import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import Exhibition from './components/Exhibition';
import Studio from './components/Studio';
import About from './components/About';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Exhibition />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
