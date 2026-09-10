import http from "http";
import fs from "node:fs/promises";

const port = 3001;
const filePath = "file.txt";

let users = [];

// Read file
async function readFile() {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return data;
    } catch (err) {
        console.log("Error found:", err);
        return null;
    }
}

// Read file content
const content = await readFile();

console.log(content);

// Create server
const server = http.createServer((req, resp) => {

    const url = req.url;
    const method = req.method;


    // GET /msg
    if (url === "/msg" && method === "GET") {

        resp.writeHead(200, {
            "Content-Type": "application/json"
        });

        resp.end(JSON.stringify({
            message: content
        }));
    }


    // GET /sis
    else if (url === "/sis" && method === "GET") {

        const userData = {
            name: "abhi",
            id: 12,
            class: "B.Tech"
        };

        resp.writeHead(200, {
            "Content-Type": "application/json"
        });

        resp.end(JSON.stringify(userData));
    }


    // POST /create
    else if (url === "/create" && method === "POST") {

        let body = "";

        // Receive data
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        // When data receiving is complete
        req.on("end", () => {

            try {

                const data = JSON.parse(body);

                const newUser = {
                    id: data.id,
                    name: data.name,
                    class: data.class
                };

                // Store user in array
                users.push(newUser);

                resp.writeHead(201, {
                    "Content-Type": "application/json"
                });

                resp.end(JSON.stringify({
                    message: "User created successfully",
                    user: newUser
                }));

            } catch (error) {

                resp.writeHead(400, {
                    "Content-Type": "application/json"
                });

                resp.end(JSON.stringify({
                    message: "Invalid JSON data"
                }));
            }
        });
    }


    // GET /users
    else if (url === "/users" && method === "GET") {

        resp.writeHead(200, {
            "Content-Type": "application/json"
        });

        resp.end(JSON.stringify(users));
    }

    // DELETE /delete/:id
    else if (url.startsWith("/delete/") && method === "DELETE") {
        
        const id = url.split("/")[2];
        
        const index = users.findIndex(user => user.id === parseInt(id));
        
        if (index !== -1) {

        users.splice(index, 1);

        resp.writeHead(200, {
            "Content-Type": "application/json"
        });

        resp.end(JSON.stringify({
            message: "User deleted successfully"
        }));

    } else {

        resp.writeHead(404, {
            "Content-Type": "application/json"
        });

        resp.end(JSON.stringify({
            message: "User not found"
        }));
    }
}

    // Edit
else if (url.startsWith("/edit/") && method === "PUT") {

    const id = url.split("/")[2];

    const index = users.findIndex(user => user.id === parseInt(id));

    if (index !== -1) {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {

            try {

                const data = JSON.parse(body);

                users[index] = {
                    id: users[index].id,
                    name: data.name || users[index].name,
                    class: data.class || users[index].class
                };

                resp.writeHead(200, {
                    "Content-Type": "application/json"
                });

                resp.end(JSON.stringify({
                    message: "User updated successfully",
                    user: users[index]
                }));

            } catch (error) {

                resp.writeHead(400, {
                    "Content-Type": "application/json"
                });

                resp.end(JSON.stringify({
                    message: "Invalid JSON data"
                }));
            }
        });

    } else {

        resp.writeHead(404, {
            "Content-Type": "application/json"
        });

        resp.end(JSON.stringify({
            message: "User not found"
        }));
    }
} 

    // Unknown route
    else {

        resp.writeHead(404, {
            "Content-Type": "application/json"
        });

        resp.end(JSON.stringify({
            message: "Route not found"
        }));
    }
});


// Start server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});