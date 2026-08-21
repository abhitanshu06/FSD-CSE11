import EventEmmiter from "node:events";
const myEmmiter = new EventEmmiter();

myEmmiter.on("greet", (student) => {
console.log(`class started by ${student}`);
});

myEmmiter.on("exit", (student) => {

console.log(`class finished by ${student}`);

});
myEmmiter.emit("greet","Abhitanshu");
myEmmiter.emit("exit","Abhitanshu");