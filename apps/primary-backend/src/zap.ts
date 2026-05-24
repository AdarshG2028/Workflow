import { Router } from "express"
import { authMiddleware } from "./middleware.js";
import { prismaClient } from "db";
import { ZapCreateSchema } from "./types/index.js";

const ZapRouter = Router();

ZapRouter.post("/",authMiddleware, async(req, res) => {
    const body = req.body;
    // @ts-ignore
    const id: string = req.id;
    const parsedData = ZapCreateSchema.safeParse(body)

    if(!parsedData.success){
        return res.status(411).json({
            message: "Invalid input"
        })
    }
    const zapId = await prismaClient.$transaction(async(tx) => {
        const zap = await tx.zap.create({
            data: {
                userId:parseInt(id),
                triggerId : " ",
                actions : {
                    create : parsedData.data.actions.map( (x,index) => ({
                        actionId : x.availableActionId,
                        actionMetadata : x.actionMetadata,
                        sortingOrder : index
                    }))
                }

            }
        })

        const trigger = await tx.trigger.create({
            data : {
                zapId :zap.id,
                triggerId : parsedData.data.availableTrigger,
                
            }
        });

        await tx.zap.update({
            where: {
                id : zap.id
            },
            data: {
                triggerId : trigger.id
            }
        });
        return zap.id
    })
    return res.json({
        id : zapId
    })
    

})
ZapRouter.get("/",authMiddleware, async(req, res) => {
    // @ts-ignore
    const id = req.id;
    const zaps = await prismaClient.zap.findMany({
        where : {
            userId : parseInt(id)
        },
        include  :{
            actions:{
                include : {
                    type: true
                }
            },
            trigger:{
                include : {
                    type: true
                }
            }
        }
    })
    return res.json({
        zaps
    })
    

})
ZapRouter.get("/:zapId",authMiddleware, async(req, res) => {
    // @ts-ignore
    const id = req.id;
    const zapId = req.params.zapId as string;
    
    const zap = await prismaClient.zap.findFirst({
        where : {
            id : zapId,
            userId : parseInt(id)
        },
        include  :{
            actions:{
                include : {
                    type: true
                }
            },
            trigger:{
                include : {
                    type: true
                }
            }
        }
    })
    return res.json({
        zap
    })
})

export const zapRouter: Router = ZapRouter