const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  particles: [],
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(state.width * state.dpr);
  canvas.height = Math.round(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  state.particles = Array.from({ length: 140 }, () => ({
    x: rand(-state.width * 0.4, state.width * 1.4),
    y: rand(-state.height * 0.4, state.height * 1.4),
    radius: rand(1, 3.5),
    speedX: rand(-0.8, 0.8),
    speedY: rand(-0.8, 0.8),
    alpha: rand(0.3, 1),
  }));
}

function drawBackground(time) {
  const g = ctx.createRadialGradient(
    state.width * 0.5,
    state.height * 0.46,
    30,
    state.width * 0.5,
    state.height * 0.5,
    state.width * 0.8
  );

  g.addColorStop(0, 'rgba(120, 78, 180, 0.26)');
  g.addColorStop(0.3, 'rgba(35, 28, 64, 0.18)');
  g.addColorStop(1, 'rgba(2, 4, 12, 0.9)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.width, state.height);

  for (let i = 0; i < state.particles.length; i += 1) {
    const p = state.particles[i];
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < -20 || p.x > state.width + 20) p.x = rand(0, state.width);
    if (p.y < -20 || p.y > state.height + 20) p.y = rand(0, state.height);

    const sweep = 0.8 + Math.sin(time * 0.9 + i) * 0.2;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * sweep})`;
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function heartPath(scale, beat) {
  const points = [];
  for (let a = 0; a <= Math.PI * 2 + 0.08; a += 0.08) {
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y =
      13 * Math.cos(a) -
      5 * Math.cos(2 * a) -
      2 * Math.cos(3 * a) -
      Math.cos(4 * a);

    points.push({
      x: x * scale * beat,
      y: -y * scale * beat,
    });
  }
  return points;
}

function drawHeart(time) {
  const cx = state.width * 0.5;
  const cy = state.height * 0.52;
  const beat = 1 + Math.sin(time * 7.3) * 0.14 + Math.sin(time * 3.3) * 0.08;
  const size = Math.min(state.width, state.height) * 0.24;
  const points = heartPath(size, beat);

  ctx.save();
  ctx.translate(cx, cy);

  ctx.shadowColor = 'rgba(255, 72, 120, 0.9)';
  ctx.shadowBlur = 35;
  ctx.fillStyle = 'rgba(255, 120, 150, 0.25)';
  ctx.beginPath();
  points.forEach((p, index) => {
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();

  const grad = ctx.createLinearGradient(-size, -size, size, size);
  grad.addColorStop(0, '#ff7bbd');
  grad.addColorStop(0.25, '#ff4b8a');
  grad.addColorStop(0.55, '#ff2d55');
  grad.addColorStop(1, '#ff0033');

  ctx.shadowColor = 'rgba(255, 80, 120, 1)';
  ctx.shadowBlur = 50;
  ctx.fillStyle = grad;
  ctx.beginPath();
  points.forEach((p, index) => {
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 220, 234, 0.9)';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  for (let i = 0; i < 9; i += 1) {
    const angle = time * 1.5 + i * 0.7;
    const spread = 28 + i * 10;
    const px = Math.cos(angle) * spread;
    const py = Math.sin(angle * 1.18) * spread * 0.9;
    const pulse = 10 + Math.sin(time * 10 + i) * 2.5;

    ctx.beginPath();
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 214, 228, 0.95)' : 'rgba(255, 136, 170, 0.9)';
    ctx.arc(px, py, 2.5 + pulse * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function animate(now) {
  const t = now * 0.001;
  ctx.clearRect(0, 0, state.width, state.height);
  drawBackground(t);
  drawHeart(t);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(animate);
