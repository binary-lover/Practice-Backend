// import './App.css'
import Card from './components/Card'
import Footer from './components/Footer'
import Navbar from './components/Navbar'

function App() {
  

  return (
    <>
    <div className="navbar">
    <Navbar/> 
    </div>
    <div className="maincard">
      <Card title="card 1" disc="card 1 disc"/>
      <Card title="card 2" disc="card 2 disc"/>
      <Card title="card 3" disc="card 3 disc"/>
      <Card title="card 4" disc="card 4 disc"/>
    </div>
    <Footer/>
    </>
  )
}

export default App
