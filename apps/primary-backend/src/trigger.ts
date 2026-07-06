
import { Router } from "express";
import { prismaClient } from "db";

const router = Router();
const client =  prismaClient;

router.get("/available", async (req, res) => {
    const availableTriggers = await client.availableTriggers.findMany({});
    res.json({
        availableTriggers
    })
});

export const triggerRouter : Router = router;