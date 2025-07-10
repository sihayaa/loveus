
// Simple Canvas Dino Jump Game
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 200;
document.body.appendChild(canvas);

let dino = { x: 50, y: 150, vy: 0, gravity: 2, jump: -25, height: 50, width: 50, grounded: true };
let cactus = { x: 800, y: 150, width: 20, height: 50, speed: 6 };
let score = 0;

document.addEventListener("keydown", function(e) {
  if (e.code === "Space" && dino.grounded) {
    dino.vy = dino.jump;
    dino.grounded = false;
  }
});

function update() {
  // Dino movement
  dino.y += dino.vy;
  dino.vy += dino.gravity;
  if (dino.y >= 150) {
    dino.y = 150;
    dino.vy = 0;
    dino.grounded = true;
  }

  // Cactus movement
  cactus.x -= cactus.speed;
  if (cactus.x < -20) {
    cactus.x = 800;
    score++;
  }

  // Collision
  if (dino.x < cactus.x + cactus.width &&
      dino.x + dino.width > cactus.x &&
      dino.y < cactus.y + cactus.height &&
      dino.y + dino.height > cactus.y) {
    alert("Game Over! Your Score: " + score);
    cactus.x = 800;
    score = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Dino
  ctx.fillStyle = "#4fa981";
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
  // Cactus
  ctx.fillStyle = "#884ea0";
  ctx.fillRect(cactus.x, cactus.y, cactus.width, cactus.height);
  // Score
  ctx.fillStyle = "#222";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 650, 30);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
