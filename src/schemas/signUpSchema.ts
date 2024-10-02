import {z} from 'zod'
export const usernameValidation = z.string()
.min(2,"username must be greather than 2 or lessthan 20 characters")
.max(20,"username must be greather than 2 or lessthan 20 characters")
.regex(/^[a-zA-Z0-9_.-]+$/, { message: "Username must not contain special symbols except '_', '-', and '.'" });
  
export const emailValidation = z.string()
.email({message : "Invalid email address"})
  
export const signUpSchema = z.object({
    username : usernameValidation,
    email : emailValidation,
    password : z.string().min(6,"password must be greather than 6 or lessthan 20 characters")
    .max(20,"password must be greather than 6 or lessthan 20 characters")
    .regex(/^a-zA-Z%@#./, "password must be not contain special sybols") 
})