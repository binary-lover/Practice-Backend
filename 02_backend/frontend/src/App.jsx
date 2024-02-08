import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [jokes,setJokes] = useState([])
  useEffect(()=>{
    axios.get('/api/jokes')
    .then((response)=>{ 
      setJokes(response.data)
    })
    .catch((error)=>{
      console.log(error);
    })
  })

  return (
    <>
    <h1>binary lover</h1>
    <p>Jokes: {jokes.length}</p>
    {
      jokes.map((joke,index)=>(
        <dev key = {joke.id}>
          <h3>{joke.question}</h3>
          <h3>{joke.answer}</h3>
        </dev>
      ))
    }

    </>
  )
}

export default App
