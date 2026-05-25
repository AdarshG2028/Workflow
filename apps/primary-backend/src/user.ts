import { Router } from "express"
import { safeParse } from "zod";
import { signinInputSchema, signupInputSchema } from "./types/index.js";
import {prismaClient} from "db";
import { JWT_SECRET } from "./config.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware.js";


const UserRouter = Router();
const client =  prismaClient;

UserRouter.post("/signup", async(req, res) => {
    const body = req.body;
    const parsedData = signupInputSchema.safeParse(body)

    if(!parsedData.success){
        return res.status(411).json({
            message: "Invalid input"
        })
    }

    const userExists = await client.user.findFirst({
        where:{
            email: parsedData.data.username
        }
    })


    if(userExists){
        return res.status(403).json({
            message: "User already exists"
        })
    }

    await prismaClient.user.create({
        data: {
            email: parsedData.data.username,
            name: parsedData.data.name,
            //To-do Hasing
            password: parsedData.data.password

        }

    })
    //await Send email

    return res.json({
        message: "User created successfully"
    })

})
UserRouter.post("/signin", async(req, res) => {
    const body = req.body;
    const parsedData = signinInputSchema.safeParse(body)

    if(!parsedData.success){
        return res.status(411).json({
            message: "Invalid input"
        })
    }

    const user = await client.user.findFirst({
        where:{
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if(!user){
        return res.status(403).json({
            message: "Invalid credentials"
        })
    }

    const token = jwt.sign({id: user.id},JWT_SECRET)

    res.json({
        token:token
    })

    
    



    
})
UserRouter.post("/",authMiddleware, async(req, res) => {
    //@ts-ignore
    const id = req.id;
    const user = await prismaClient.user.findFirst({
        where:{
            id
        },
        select : {
            email : true,
            name : true,
            
        }
    })
    if(user){
        return res.json({
            user
        })
    }


})

export const userRouter: Router = UserRouter