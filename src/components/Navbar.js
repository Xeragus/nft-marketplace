import '../App.css';

import { Navbar, Container, Nav } from 'react-bootstrap';

function App() {
  return (
    <Navbar bg="dark" variant="dark" className="Nav-padding-bottom">
        <Container>
          <Navbar.Brand href="/">art u own</Navbar.Brand>
          <Nav className="justify-content-end">
              <Nav.Link href="/">exhibition</Nav.Link>
              <Nav.Link href="/studio">studio</Nav.Link>
              <Nav.Link href="/about">about us</Nav.Link>
          </Nav>
        </Container>
    </Navbar>
  );
}

export default App;