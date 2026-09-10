import express from "express";
//import dotev from "dotenv";
import cors from "cors";
//dotev.config();
//const port=process.env.PORT || 3000;
const port=3000;
const app=express();
const userData=[
    {
    },
];

const registerData=[

];

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Welcome user",
    });
});

app.get("/user",(req,res)=>{
    try {
        res.status(200).json({
            users: userData
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.get("/register",(req,res)=>{
    try {
        res.status(200).json({
            message: "Data fetched successfully",
            users: registerData
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.get("/user/:id",(req,res)=>{
    try {
        const{name,email}=req.body;
        const newUser={
            id:userData.length+1,
            name,
            email,
        };
        userData.push(newUser);
        res.status(20).json({message:"User created successfully",newUser});
    }
    catch(err){
        console.error("Error: ",err.message);
    }
});


app.post("/create",(req,res)=>{
    const {id,name,class:className}=req.body;
    const newUser={
        id,
        name,
        class:className,
    };
    userData.push(newUser);
    res.status(201).json({  
        message: "User created successfully",
        user: newUser
    });
});

app.put("/edit/:id",(req,res)=>{
    const userId=parseInt(req.params.id);
    const index=userData.findIndex(user=>user.id===userId);
    if (index !== -1) {
        const {name,class:className}=req.body;
        userData[index]={
            ...userData[index],
            name,
            class:className
        };
        res.status(200).json({
            message: "User updated successfully",
            user: userData[index]
        });
    } else {
        res.status(404).json({
            message: "User not found"
        });
    }
});

app.delete("/delete/:id",(req,res)=>{
    const userId=parseInt(req.params.id);
    const index=userData.findIndex(user=>user.id===userId);
    if (index !== -1) {
        userData.splice(index,1);
        res.status(200).json({
            message: "User deleted successfully"
        });
    } else {
        res.status(404).json({
            message: "User not found"
        });
    }
});

app.post("/register",(req,res)=>{
    const {username,password}=req.body;
    const newUser={
        username,
        password
    };
    registerData.push(newUser);
    res.status(201).json({
        message: "User registered successfully",
        user: newUser
    });
});

app.post("/login",(req,res)=>{
    const {username,password}=req.body;
    const user=registerData.find(user=>user.username===username && user.password===password);
    if (user) {
        res.status(200).json({
            message: "Login successful",
            user: user
        });
    } else {
        res.status(401).json({
            message: "Invalid credentials"
        });
    }
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});