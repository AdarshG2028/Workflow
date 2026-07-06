

import { Router } from "express";
import { prismaClient } from "db";

const router = Router();
const client =  prismaClient;

router.get("/available", async (req, res) => {
    const availableActions = await client.availableActions.findMany({});
    res.json({
        availableActions
    })
});

export const actionRouter : Router = router;