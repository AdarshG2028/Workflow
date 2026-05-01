import express, { Request, Response } from 'express';
import { prismaClient } from 'db';

const app = express();
app.use(express.json());
const port = 3000;

app.post('/hooks/catch/:userId/:zapId', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    await prismaClient.$transaction(async tx => {
        const run = await tx.zapRun.create({
            data: {
                zapId: String(zapId),
                metadata: body
            }
        });

        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        })
    })

    res.json({
        message: "Hook received"
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});