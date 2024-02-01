// const express = require('express')
// require('dotenv').config(); 
import express from 'express';
// import .env from 'dotenv';

const app = express();
const port = process.env.PORT || 5000

// list of 5 jokes
const jokes = [
    {
        id: 1,
        question: "What is the difference between a snowman and a snowwoman?",
        answer: "Snowballs."
    },
    {
        id: 2,
        question: "What do you call a boomerang that won't come back?",
        answer: "A stick."
    },
    {
        id: 3,
        question: "What do you call a cow with no legs?",
        answer: "Ground beef."
    },
    {
        id: 4,
        question: "What do you call a cow with two legs?",
        answer: "Lean beef."
    },
    {
        id: 5,            
        question: "What do you call a cow with all of its legs?",
        answer: "High steaks."
    }
]

// app.get('/',(req,res)=>{
//     res.send("<h1>good morning</h1>")
// });

app.get('/api/jokes',(req,res)=>{
    // res.send(jokes[Math.floor(Math.random()*jokes.length)])
    res.send(jokes);
})

app.listen(port,()=>{
    console.log("app listining at port ",port,"http://localhost:5000/");
})