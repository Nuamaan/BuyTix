import express , {Request,Response} from 'express';
import { body } from 'express-validator';
import {BadRequestError,validateRequest} from '@nuamaantickets/common_new'

import { User } from '../models/user';
import  jwt  from 'jsonwebtoken';


const router = express.Router();

router.post('/api/users/signup' ,
    [
        body('email')
            .isEmail()
            .withMessage('Email must be present'),
        body('password')
            .trim()
            .isLength({min:4,max:20})
            .withMessage('Password should be of length between 4 and 20')
    ],
    validateRequest,
    async (req:Request,res:Response) => {
        
        const {email,password} = req.body;
        const existingUser =  await User.findOne({email})
        if(existingUser){
            throw new BadRequestError('Email in use.')
        }

        const user = User.build({email,password})
        await user.save()

        const userJwt = jwt.sign({
                id:user.id,
                email:user.email
            }, 
            process.env.JWT_KEY!    
        )

        req.session = {
            jwt:userJwt
        }

        res.status(201).send(user)
    })

export {router as signupRouter}