import { EventEmitter } from "node:events";

function createDomElements() {
  const emitter = new EventEmitter();
  return {
    addEventListener(eventType, listener) {
      emitter.on(eventType, listener);
    },
    removeEventListener(eventType, listener) {
      emitter.off(eventType, listener);
    },
    dispatchEvent(event) {
      event.target = this;
      event.currentTarget = this;
      emitter.emit(event.eventType, event);
    },
  };
}
const button = createDomElements();
button.addEventListener("save", () => {
  console.log("saving...");
});
button.addEventListener("submit", () => {
  console.log("Data Submitted succesfully");
});
function handleClick(event) {
  console.log("mouse clicked");
  console.log(event.eventType);
  console.log(`message:${event.detail}`);
}
button.addEventListener("click", (event) => {
  console.log("mouse clicked");
  console.log(event.eventType);
  console.log(`message:${event.detail}`);
});
button.addEventListener("click", handleClick);
button.dispatchEvent({
  eventType: "save",
});
button.dispatchEvent({});