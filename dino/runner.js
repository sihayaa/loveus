
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 200;
document.body.appendChild(canvas);

const sprite = new Image();
sprite.src = 'offline-sprite.png';

sprite.onload = function () {
  ctx.drawImage(sprite, 0, 0);
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText('Dino Game Ready! (Replace with real runner logic)', 200, 100);
};
