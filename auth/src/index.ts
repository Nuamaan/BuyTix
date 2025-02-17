import mongoose from "mongoose";
import { app } from "./app";


const start = async () => {
    console.log('Auth service is starting up -> ')
    if (!process.env.JWT_KEY){
        throw new Error('JWT_KEY not defined')
    }
    if (!process.env.MONGO_URI){
        throw new Error('MONGO_URI not defined')
    }
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to database')
    } catch (error) {
        console.error(error)
    }
    app.listen( 3000, () => {
        console.log('Listening on port 3000!!!!')
    })
}

start()