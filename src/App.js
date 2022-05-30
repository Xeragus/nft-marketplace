import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import Exhibition from './components/Exhibition';
import Studio from './components/Studio';
import About from './components/About';
import Navbar from './components/Navbar';
import MyAssets from './components/MyAssets';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Container>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Exhibition />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/about" element={<About />} />
          <Route path="/my-assets" element={<MyAssets />} />
        </Routes>
      </div>
    </Container>
  );
}

export default App;
