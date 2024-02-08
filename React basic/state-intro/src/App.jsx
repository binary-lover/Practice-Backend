import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(1)

  return (
    <>
      <p>this is {count}</p>
      <button onClick={()=>{
        setCount(2**count)
      }}>Update</button>
    </>
  )
}

export default App
