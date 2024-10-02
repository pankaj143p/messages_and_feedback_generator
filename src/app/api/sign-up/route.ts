import dbConnect from "@/lib/dbConnects";  // Ensure this is correctly set up for MongoDB connection
import UserModel from "@/Models/userModel";
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from "@/Helpers/sendVerificationsEmail";  // Ensure this function is implemented correctly
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    await dbConnect();  // Connect to the database
    try {
        const { username, email, password } = await request.json();  // Parse the request JSON
        console.log(username, email, password);
        
        // Check if a verified user exists by username
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });
      
        if (existingUserVerifiedByUsername) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username already exists",
                },
                {
                    status: 400,
                }
            ); 
        }
        
        // Check if a user exists by email
        const existingUserVerifiedByEmail = await UserModel.findOne({
            email
        });
        
        // Generate a random verification code (OTP)
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Email already exists with user",
                    },
                    {
                        status: 400,
                    }
                );
            } else {
                const hashPassword = await bcrypt.hash(password, 10);
                existingUserVerifiedByEmail.password = hashPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
                await existingUserVerifiedByEmail.save();
            }
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiry

            const newUser = new UserModel({
                username,
                email,
                password: hashPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                createdAt: new Date(),  // Set current date
                isAcceptedMessage: true,
                isVerified: false,
                messages: [],
            });
            await newUser.save();
        }
        
        // Send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        
        if (!emailResponse.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: emailResponse.message,
                },
                {
                    status: 500,
                }
            );
        }
        
        return NextResponse.json(
            {
                success: true,
                message: "User created successfully, please verify your email",
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error('Error Registering User', error);
        return NextResponse.json(
            {
                success: false,
                message: (error as Error).message || "An error occurred while creating the user",
            },
            {
                status: 500,
            }
        );         
    }
}
