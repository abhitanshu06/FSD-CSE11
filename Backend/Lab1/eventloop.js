console.log("This is the starting point of my code");
process.nextTick(()=>{
    console.log("This process.nextTick operation");
})
setTimeout(() => {
    console.log("This is first timeout operation");
}, 2000);
console.log("This is the end point of my code");
setTimeout(()=>{
    console.log("this is second timeout operation");
},1000);
console.log("")
console.log("This is the starting point of my code");
process.nextTick(()=>{
    console.log("This process.nextTick operation");
})
new Promise((resolve,reject)=>{
    let success = true;
    if(success)
        resolve("Data loaded successsfully");
    else 
        reject ("data loading failad ")
}).then((message )=>{
    console.log(message);  

}).catch((message)=>{
    console.log(message);
});
console.log("this is the starting point of my code");
console.log("this is the end point of my code");