import dbConnect from "@/lib/dbConnects";
import UserModel from "@/Models/userModel";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

// username schema query
const usernameQueryScheme = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        //  params for validation 
        const {searchParams} = new URL(request.url)
        const queryParam = {username:searchParams.get('username')}
        // validation of query params using zod
        const result = usernameQueryScheme.safeParse(queryParam)

        console.log(result);
        // if validation is unsuccessful then proceed with the query
        if(!result.success) {
            const usernameError = result.error.format().username?._errors || []
            return Response.json({
                succuss : false,
                message : 'Invalid query parameter'
            },{
                status : 400
            })
        }
        const {username} = result.data
        //  check for username is already exist
        const existingUserVerifiedUser = await UserModel.findOne({
            username, isVarified: true
        })
        // if user name already present 
         
        if(existingUserVerifiedUser){
            return Response.json({
                succuss : false,
                message : 'Username already exist'
            },{
                status : 400
            })
        }
        return Response.json({
            succuss : true,
            message : 'Username is unique'
        },{
            status : 200
        })
        // catch for showing error
    } catch (error) {
        console.error("Error checking username")
        return Response.json({
            status: false,
            message: "Error checking username",
        },{
            status: 500
        })
    }
}


