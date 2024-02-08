import React from 'react'
import Footer from './Footer'

function navbar({text}) {
  return (
    <div>
      <div className="text">{text}</div>
      <ul>
        <li>home</li>
        <li>about</li>
        <li>contact</li>
      </ul>
      <Footer/>
    </div>
  )
}

export default navbar
