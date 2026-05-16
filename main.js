const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const messageEl = document.getElementById('message');

const W = canvas.width;
const H = canvas.height;

const PADDLE_W = 80;
const PADDLE_H = 10;
const BALL_R = 7;
const BLOCK_ROWS = 5;
const BLOCK_COLS = 8;
const BLOCK_H = 20;
const BLOCK_GAP = 4;
const BLOCK_TOP = 40;

const BLOCK_COLORS = ['#e94560', '#e94560', '#f5a623', '#f5a623', '#4ecdc4'];

// Game state
let state = 'idle'; // idle | playing | dead | win | over
let score = 0;
let lives = 3;

// Paddle
const paddle = { x: W / 2 - PADDLE_W / 2, y: H - 30, w: PADDLE_W, h: PADDLE_H };

// Ball
const ball = { x: 0, y: 0, vx: 0, vy: 0 };

// Blocks
let blocks = [];

function initBlocks() {
  blocks = [];
  const totalGap = BLOCK_GAP * (BLOCK_COLS + 1);
  const bw = (W - totalGap) / BLOCK_COLS;
  for (let r = 0; r < BLOCK_ROWS; r++) {
    for (let c = 0; c < BLOCK_COLS; c++) {
      blocks.push({
        x: BLOCK_GAP + c * (bw + BLOCK_GAP),
        y: BLOCK_TOP + r * (BLOCK_H + BLOCK_GAP),
        w: bw,
        h: BLOCK_H,
        color: BLOCK_COLORS[r],
        alive: true,
      });
    }
  }
}

function resetBall() {
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - BALL_R - 2;
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 4);
  const speed = 4.5;
  ball.vx = Math.cos(angle) * speed;
  ball.vy = Math.sin(angle) * speed;
}

function startGame() {
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  initBlocks();
  paddle.x = W / 2 - PADDLE_W / 2;
  resetBall();
  state = 'playing';
  messageEl.textContent = '';
}

// Mouse control
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  paddle.x = Math.max(0, Math.min(W - paddle.w, mx - paddle.w / 2));
});

// Keyboard control
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    if (state === 'idle' || state === 'over' || state === 'win') startGame();
  }
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

canvas.addEventListener('click', () => {
  if (state === 'idle' || state === 'over' || state === 'win') startGame();
});

function rectBallCollide(rx, ry, rw, rh) {
  const nearX = Math.max(rx, Math.min(ball.x, rx + rw));
  const nearY = Math.max(ry, Math.min(ball.y, ry + rh));
  const dx = ball.x - nearX;
  const dy = ball.y - nearY;
  return dx * dx + dy * dy <= BALL_R * BALL_R;
}

function update() {
  if (state !== 'playing') return;

  // Keyboard paddle movement
  if (keys['ArrowLeft']) paddle.x = Math.max(0, paddle.x - 6);
  if (keys['ArrowRight']) paddle.x = Math.min(W - paddle.w, paddle.x + 6);

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collisions
  if (ball.x - BALL_R <= 0) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
  if (ball.x + BALL_R >= W) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - BALL_R <= 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }

  // Paddle collision
  if (rectBallCollide(paddle.x, paddle.y, paddle.w, paddle.h) && ball.vy > 0) {
    const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    const angle = hitPos * (Math.PI / 3);
    const speed = Math.hypot(ball.vx, ball.vy);
    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.abs(Math.cos(angle) * speed);
    ball.y = paddle.y - BALL_R;
  }

  // Block collisions
  for (const b of blocks) {
    if (!b.alive) continue;
    if (!rectBallCollide(b.x, b.y, b.w, b.h)) continue;

    b.alive = false;
    score += 10;
    scoreEl.textContent = score;

    // Determine bounce direction
    const overlapL = (ball.x + BALL_R) - b.x;
    const overlapR = (b.x + b.w) - (ball.x - BALL_R);
    const overlapT = (ball.y + BALL_R) - b.y;
    const overlapB = (b.y + b.h) - (ball.y - BALL_R);
    const minH = Math.min(overlapL, overlapR);
    const minV = Math.min(overlapT, overlapB);
    if (minH < minV) ball.vx = -ball.vx;
    else ball.vy = -ball.vy;
    break;
  }

  // Ball lost
  if (ball.y - BALL_R > H) {
    lives--;
    livesEl.textContent = lives;
    if (lives <= 0) {
      state = 'over';
      messageEl.textContent = 'ゲームオーバー！ スペースまたはクリックでリトライ';
    } else {
      resetBall();
    }
  }

  // Win check
  if (blocks.every(b => !b.alive)) {
    state = 'win';
    messageEl.textContent = 'クリア！ スペースまたはクリックでもう一度';
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Blocks
  for (const b of blocks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 3);
    ctx.fill();
  }

  // Paddle
  ctx.fillStyle = '#a8dadc';
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
  ctx.fill();

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Init
initBlocks();
resetBall();
loop();
