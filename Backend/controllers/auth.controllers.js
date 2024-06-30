import User from "../Models/user.model.js"
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const {fullName, userName, password, confirmPassword, gender} = req.body;
        if(password  !== confirmPassword){
            return res.status(400).json({error: "passwords dont match"})
        }

        const user = await User.findOne({userName})
        if(user){
            return res.status(400).json({error:"Username already exists"})
        }

        // hashing pass here
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)


        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`

        const newUser = new User({
            userName,
            fullName,
            password: hashedPassword                                     ,
            gender,
            profilePic: gender=="male"?boyProfilePic:girlProfilePic

        })

        if(newUser){
            await newUser.save();
            generateTokenAndSetCookie(newUser._id, res)

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            userName: newUser.userName,
            profilePic: newUser.profilePic
        })
        } else{
            res.status(400).json({error: "invalid user data"})
        }

    } catch (error) {
        console.log("error in signup controller",  error.message)
        res.status(500).json({error:"internal server error"})
    }
}

export const login = async (req, res) => {
    try {
        const { userName, password } = req.body;
        const user = await User.findOne({userName})
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password||"")
        if(!user || !isPasswordCorrect){
            res.status(401).json({error: "incorrect Username or password"})
        }

        generateTokenAndSetCookie(user._id, res);
        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            userName: user.userName,
            profilePic: user.profilePic
        })   

    } catch (error) {
        console.log("error in login controller",  error.message)
        res.status(500).json({error:"internal server error"})    
    }

}

export const logout = (req, res) => {
   try {
    res.cookie("jwt", "", {maxAge: 0})
    res.status(200).json({message: "logged out sucessfully"})
   } catch (error) {
        console.log("error in logOut controller",  error.message)
        res.status(500).json({error:"internal server error"})   
   }
}