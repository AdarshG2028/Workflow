import {z} from "zod";


export const signupInputSchema = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name:z.string().min(3)
})



export const signinInputSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export const ZapCreateSchema = z.object({
    availableTrigger:z.string(),
    triggerMetadata:z.string(),
    actions:z.array(z.object({
        availableActionId:z.string(),
        actionMetadata:z.string().optional()
    }))
});