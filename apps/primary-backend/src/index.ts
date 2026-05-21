import express from "express"
import user = require("./user");
import { zapRouter } from "./zap.js";
import cors from "cors"

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors())

app.use("/api/v1/user",user.userRouter)

app.use("/api/v1/zap",zapRouter)



app.post("/event/:id",(req,res)=>{
    const eventId = req.params.id;
    
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})