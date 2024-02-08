import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import Navbar from './components/navbar';
import Footer from './components/Footer';

function App() {
  const [value, setValue] = useState(0)
  return (
    <div className="App">
      <Navbar text="binary lover"/>
      <div className="value">{value}</div>
      <button onClick={()=>{setValue(value+1)}}>Click me</button>
      
      <Footer text="from binary lover" region="india"/>
    </div>
  );
}

export default App;
