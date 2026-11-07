const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  dots: [],
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  animationStart = null;

  canvas.width = Math.round(state.width * state.dpr);
  canvas.height = Math.round(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  const count = 1800;
  const sideDotCount = Math.floor(count * 0.45);
  state.dots = Array.from({ length: count }, (_, i) => ({
    angle: i < sideDotCount
      ? (i % 2 === 0 ? Math.PI / 2 : Math.PI * 1.5) + rand(-0.65, 0.65)
      : ((i - sideDotCount) / (count - sideDotCount)) * Math.PI * 2,
    radius: rand(0.62, 1),
    depth: rand(-1, 1),
    startDelay: rand(0, 1.25),
    travelTime: rand(3.8, 5),
    spin: rand(2.5, 5) * (Math.random() < 0.5 ? -1 : 1),
    phase: rand(0, Math.PI * 2),
    fadeStart: rand(7.5, 8.8),
    fadeTime: rand(2.4, 3.2),
    size: rand(2, 4),
    alpha: rand(0.8, 1),
  }));
}

function drawBackground(time) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, state.width, state.height);
}

function heartPoint(a, scale) {
  const x = 16 * Math.pow(Math.sin(a), 3);
  const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
  return { x: (x / 16) * scale, y: (-y / 17) * scale };
}

function drawHeartDots(time) {
  const cx = state.width * 0.5;
  const cy = state.height * 0.5;
  const scale = Math.min(state.width, state.height) * 0.27;
  const rotationY = Math.sin(time * 0.8) * 0.45;
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  const focalLength = scale * 4;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowBlur = 9;

  state.dots.forEach((dot) => {
    const travelProgress = Math.max(0, Math.min(1, (time - dot.startDelay) / dot.travelTime));
    const eased = travelProgress * travelProgress * (3 - 2 * travelProgress);
    const target = heartPoint(dot.angle, scale * dot.radius);
    const spinAngle = dot.phase + travelProgress * dot.spin * Math.PI * 2;
    const swirl = scale * 0.28 * Math.sin(Math.PI * eased) * (1 - eased);
    const rawX = target.x * eased + Math.cos(spinAngle) * swirl;
    const rawY = target.y * eased + Math.sin(spinAngle) * swirl;
    const rawZ = dot.depth * scale * 0.18 * Math.sqrt(1 - dot.radius * dot.radius) * eased;
    const rotatedX = rawX * cosY + rawZ * sinY;
    const rotatedZ = -rawX * sinY + rawZ * cosY;
    const rotatedY = rawY;
    const depth = rotatedZ;
    const perspective = focalLength / (focalLength - depth);
    const projectedX = rotatedX * perspective;
    const projectedY = rotatedY * perspective;
    const fadeProgress = Math.max(0, Math.min(1, (time - dot.fadeStart) / dot.fadeTime));
    const opacity = dot.alpha * (1 - fadeProgress);
    const lightness = 76 - dot.radius * 30 + dot.depth * 8;
    const size = dot.size * (1 - fadeProgress * 0.85) * Math.max(0.65, Math.min(1.35, perspective));
    const x = projectedX * (1 - fadeProgress);
    const y = projectedY * (1 - fadeProgress);

    if (opacity <= 0.01) return;
    ctx.beginPath();
    ctx.fillStyle = `hsla(335, 100%, ${lightness}%, ${opacity})`;
    ctx.shadowColor = `hsla(335, 100%, ${lightness + 5}%, 1)`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function smoothStep(start, end, value) {
  const progress = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return progress * progress * (3 - 2 * progress);
}

function drawCaption(time) {
  const scale = Math.min(state.width, state.height) * 0.27;
  const fontSize = Math.max(20, Math.min(42, state.width * 0.06));
  const fadeIn = smoothStep(0.3, 5.8, time);
  const fadeOut = 1 - smoothStep(6.7, 10.8, time);

  ctx.save();
  ctx.globalAlpha = fadeIn * fadeOut;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `italic 700 ${fontSize}px "Segoe Print", "Bradley Hand", cursive`;
  ctx.fillStyle = '#8b0000';
  ctx.fillText('I LOVE YOU', state.width * 0.5, state.height * 0.5 - scale - fontSize * 0.65);
  ctx.restore();
}

function drawEndCard(time) {
  const centerX = state.width * 0.5;
  const centerY = state.height * 0.5;
  const fontSize = Math.max(22, Math.min(38, state.width * 0.052));
  const fadeOut = 1 - smoothStep(17.1, 18, time);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#8b0000';

  const revealText = (text, y, font, delay) => {
    const progress = smoothStep(delay, delay + 0.7, time);
    ctx.globalAlpha = progress * fadeOut;
    ctx.font = font;
    ctx.fillText(text, centerX, y + (1 - progress) * 18);
  };

  revealText(
    'Made By :',
    centerY - fontSize * 1.5,
    `italic 700 ${fontSize}px "Segoe Print", "Bradley Hand", cursive`,
    12
  );

  const monogramProgress = smoothStep(12.7, 13.4, time);
  ctx.globalAlpha = monogramProgress * fadeOut;
  ctx.save();
  ctx.translate(centerX, centerY + fontSize * 0.25 + (1 - monogramProgress) * 18);

  const monogramSize = fontSize * 1.15;
  const ink = ctx.createLinearGradient(-monogramSize, -monogramSize, monogramSize, monogramSize);
  ink.addColorStop(0, '#f2c879');
  ink.addColorStop(0.45, '#a83b45');
  ink.addColorStop(1, '#5d0718');

  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.shadowColor = 'rgba(190, 88, 83, 0.32)';
  ctx.shadowBlur = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0, 0, monogramSize * 0.72, monogramSize * 0.58, -0.12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 0, monogramSize * 0.64, monogramSize * 0.5, -0.12, Math.PI * 1.05, Math.PI * 2.92);
  ctx.stroke();

  ctx.shadowBlur = 2;
  ctx.font = `italic 600 ${fontSize * 1.3}px "Bodoni MT", "Didot", Georgia, serif`;
  ctx.fillText('M', 0, fontSize * 0.04);

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-monogramSize * 0.96, monogramSize * 0.27);
  ctx.bezierCurveTo(-monogramSize * 0.56, monogramSize * 0.68, monogramSize * 0.24, monogramSize * 0.69, monogramSize * 0.94, monogramSize * 0.2);
  ctx.quadraticCurveTo(monogramSize * 0.65, monogramSize * 0.78, monogramSize * 0.2, monogramSize * 0.72);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(-monogramSize * 0.88, monogramSize * 0.25, 1.5, 0, Math.PI * 2);
  ctx.arc(monogramSize * 0.9, monogramSize * 0.22, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  revealText(
    'Thank you',
    centerY + fontSize * 2.1,
    `italic 700 ${fontSize}px "Segoe Print", "Bradley Hand", cursive`,
    13.4
  );

  ctx.restore();
}

let animationStart = null;
function animate(now) {
  if (animationStart === null) animationStart = now;
  const t = ((now - animationStart) / 1000) % 18;
  ctx.clearRect(0, 0, state.width, state.height);
  drawBackground(t);
  drawHeartDots(t);
  drawCaption(t);
  drawEndCard(t);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(animate);
