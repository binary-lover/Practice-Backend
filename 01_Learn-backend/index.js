require('dotenv').config()
const express = require('express')
const path = require('path');
const app = express()
const admin = express()
// const port = 4000


admin.get('/',function(req,res){
    console.log(admin.mountpath);
    res.send("admin homepage")
})

app.use('/admin', admin)  // it will create sub app in main app 

admin.get('/love',(req,res)=>{
    res.send("this is love");
})

admin.get('/twiter', ( req,res) => {
    res.send("this is twitter..! for admin")
})
app.get('/', (req, res) => {
    res.send("<h1>hello world!</h1>")
})

app.get('/twiter', ( req,res) => {
    res.send("this is twitter..!")
})
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT, () => { // using process.env.{variable_name} defined in .env file
    console.log(`Example app listening on port ${process.env.PORT}`);
    console.dir(app.locals);
})

