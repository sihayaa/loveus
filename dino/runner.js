const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let dino = {
  x: 50,
  y: 150,
  width: 40,
  height: 40,
  vy: 0,
  gravity: 2,
  jump: -25,
  grounded: true
};

let cactus = {
  x: 900,
  y: 160,
  width: 20,
  height: 40,
  speed: 6
};

let score = 0;
let gameOver = false;

document.addEventListener("keydown", function(e) {
  if (e.code === "Space" && dino.grounded && !gameOver) {
    dino.vy = dino.jump;
    dino.grounded = false;
  }
});

function resetGame() {
  cactus.x = 900 + Math.random() * 200;
  score = 0;
  gameOver = false;
  dino.y = 150;
  dino.vy = 0;
  dino.grounded = true;
}

function update() {
  if (gameOver) return;

  // Dino jump physics
  dino.y += dino.vy;
  dino.vy += dino.gravity;
  if (dino.y >
