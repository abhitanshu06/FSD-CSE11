import fs from "node:fs/promises";

const filepath = "data.txt";

async function createFile(content) {
    try {
        await fs.writeFile(filepath, content, "utf-8");
        console.log("File created successfully");
    } catch (error) {
        console.log("Code not executed successfully");
    }
}

async function readFile() {
    try {
        const data = await fs.readFile(filepath, "utf8");
        console.log("File contents:", data);
    } catch (err) {
        console.error("Error reading file:", err);
    }
}

async function appendFile(content) {
    try {
        await fs.appendFile(filepath, content, "utf8");
        console.log("Content appended successfully");
    } catch (err) {
        console.error("Error appending file:", err);
    }
}

async function deleteFile() {
    try {
        await fs.unlink(filepath);
        console.log("File deleted successfully");
    } catch (err) {
        console.error("Error deleting file:", err);
    }
}

createFile("Hello World\n");
readFile();
appendFile("This is new content\n");
deleteFile();