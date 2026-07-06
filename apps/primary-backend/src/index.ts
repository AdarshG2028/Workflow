import express from "express"
import { userRouter } from "./user.js";
import { zapRouter } from "./zap.js";
import cors from "cors"
import { triggerRouter } from "./trigger.js";
import { actionRouter } from "./actions.js";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors())

app.use("/api/v1/user",userRouter)

app.use("/api/v1/zap",zapRouter)

app.use("/api/v1/trigger", triggerRouter);

app.use("/api/v1/action", actionRouter);


app.post("/event/:id",(req,res)=>{
    const eventId = req.params.id;
    
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

