import React from 'react'
import './Card.css'
const Card = (props) => {
  return (
    <div className='card'>
        <img src="https://imgs.search.brave.com/0whpRQCEu83A2ddus1xuXvYceC09vmrX83M3MogWw50/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9wbHVz/LnVuc3BsYXNoLmNv/bS9wcmVtaXVtX3Bo/b3RvLTE2NjE2NjI4/NTAyMjYtODNjOTgx/ZWQ0ZWJhP3E9ODAm/dz0xMDAwJmF1dG89/Zm9ybWF0JmZpdD1j/cm9wJml4bGliPXJi/LTQuMC4zJml4aWQ9/TTN3eE1qQTNmREI4/TUh4elpXRnlZMmg4/TVh4OGQyOXlheVV5/TUd4aGNIUnZjSHhs/Ym53d2ZId3dmSHg4/TUE9PQ" alt="" width={310} />
      <h1>{props.title}</h1>
      <p>{props.disc}</p>
    </div>
  )
}

export default Card
