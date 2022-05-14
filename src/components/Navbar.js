import '../App.css';

import { Navbar, Container, Nav } from 'react-bootstrap';

function App() {
  return (
    <Navbar bg="dark" variant="dark">
        <Container>
        <Navbar.Brand href="#home">art u own</Navbar.Brand>
        <Nav className="me-auto">
            <Nav.Link href="/">exhibition</Nav.Link>
            <Nav.Link href="/studio">studio</Nav.Link>
            <Nav.Link href="/about">about us</Nav.Link>
        </Nav>
        </Container>
    </Navbar>
  );
}

export default App;