import { spawn } from "node:child_process";
import { watch } from "node:fs";

let running = false;
let pending = false;
let timer;

function generate() {
  pending = true;
  if (running) return;

  pending = false;
  running = true;
  const child = spawn("npm", ["run", "generate"], { stdio: "inherit" });
  child.on("error", (error) => console.error(error.message));
  child.on("close", (code) => {
    running = false;
    if (code !== 0) console.error("Generation failed; waiting for changes.");
    if (pending) generate();
  });
}

watch("src", { recursive: true }, (_event, filename) => {
  if (filename && !filename.endsWith(".tsp")) return;
  clearTimeout(timer);
  timer = setTimeout(generate, 150);
});

console.log("Watching src/**/*.tsp. Press Ctrl+C to stop.");
generate();
