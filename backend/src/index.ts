import express from 'express';

const app = express();

const PORT = 3000;

app.get('/',(request,response,next)=>{
    console.log('Request received at /api/users');
});

app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
})
