import http, { request } from "http";
import fs from "node:fs/promises";
import { json } from "node:stream/consumers";
const arr = [
    {
        name: "ABhi",
        dept: "Cse",
        classs: "Cse11",
    },
    {
        name: "Abhitansu",
        dept: "Cse",
        classs: "Cse11",
    },
    {
        name: "sonkar",
        dept: "Cse",
        classs: "Cse13",
    },
];

// const filePath = "./userData.txt";
// async function createFile(content) {
//     try {
//         await fs.writeFile(filePath, content, "UTF-8");
//         console.log(`File create sucessfully:- ${content}`)
//     }
//     catch (error) {
//         console.log(`Error in file ${error}`);
//     }
// }
// async function appenFile() {
//     try {
//         await fs.appendFile(filePath, content, "UTF-8");
//         console.log(`File create sucessfully:- ${content}`)
//     }
//     catch (error) {
//         console.log(`Error in file ${error}`);
//     }
// }
// createFile("Hello world");

const server = http.createServer((req, res) => {
    const reqUrl = req.url;
    const method = req.method;

    if (reqUrl === "/msg" && method === "GET") {
        res.status = 200;
        res.setHeader = ("Content-Type", "text/plain");
        res.end("Welcome to backend");
    } else if (reqUrl === "/user") {
        res.end(JSON.stringify(arr));
    } else if (reqUrl === "/create" && method === "POST") {
        // let body = "";
        // res.on("data", (content) => {
        //     body = body + content;
        // });
        // const data = JSON.parse(body);
        // const newUser = {
        //     name: data.name,
        //     dept: data.dept,
        //     classs: data.classs,
        // };
        // res.statusCode = 201;
        // res.setHeader("Content-Type", "application/json");
        // arr.push(newUser);
        // req.end(arr);
        // res.end(
        //     JSON.stringify({
        //         message: "User created successfully",
        //         user: newUser,
        //     }),
        // );
         let body = "";

        // Receive request body
        req.on("data", (content) => {
            body += content;
        });

        // Body completely received
        req.on("end", () => {

            const data = JSON.parse(body);

            const newUser = {
                name: data.name,
                dept: data.dept,
                classs: data.classs
            };

            arr.push(newUser);

            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");

            res.end(JSON.stringify("User created successfully"));
        });
    }
});
server.listen(4000, () => {
    console.log(`Server is running on port number `);
});

// http.createServer.listen(3000,()=>{
//    console.log("Server is running on port number 3000")
// })
// server.listen(3000)