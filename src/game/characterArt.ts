import { CharacterAction, CharacterSkin, PowerUpActive } from './types';

/**
 * Procedural Vector Cartoon Character Renderer
 * Modeled after the hero in the game poster:
 * Red & white baseball cap, brown anime hair, smiling face,
 * red zip hoodie, backpack, blue jeans, and red/white sneakers!
 */

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  action: CharacterAction,
  animTime: number,
  skin: CharacterSkin,
  activePowerUps: PowerUpActive[],
  isInvincible: boolean = false
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height);

  // If hit/invincible, blink
  if (isInvincible && Math.floor(animTime * 15) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  // Draw active power-up background aura
  drawPowerUpAura(ctx, activePowerUps, animTime);

  const colors = skin.colors;

  if (action === 'SLIDE') {
    drawSlidingPose(ctx, colors, animTime);
  } else if (action === 'CRASH') {
    drawCrashPose(ctx, colors, animTime);
  } else if (action === 'DOUBLE_JUMP') {
    drawDoubleJumpPose(ctx, colors, animTime);
  } else if (action === 'JUMP') {
    drawJumpPose(ctx, colors, animTime);
  } else {
    // RUNNING
    drawRunPose(ctx, colors, animTime);
  }

  // Draw power-up foreground aura (e.g. Shield dome)
  drawPowerUpForeground(ctx, activePowerUps, animTime);

  ctx.restore();
}

/**
 * RUNNING ANIMATION
 */
function drawRunPose(
  ctx: CanvasRenderingContext2D,
  colors: CharacterSkin['colors'],
  animTime: number
) {
  // Run cycle frequency (approx 10 steps per second)
  const cycle = animTime * 10;
  const legAngle = Math.sin(cycle) * 0.75; // -0.75 to +0.75 rad
  const bobbing = Math.abs(Math.sin(cycle)) * 6; // up/down bob
  const armAngle = -legAngle * 0.8;

  ctx.save();
  ctx.translate(0, -bobbing);

  // 1. Back Arm
  ctx.save();
  ctx.translate(-8, -52);
  ctx.rotate(-armAngle - 0.3);
  drawLimb(ctx, colors.hoodie, '#000', 7, 24);
  // Back hand
  ctx.fillStyle = '#fcd34d'; // skin
  ctx.beginPath();
  ctx.arc(0, 24, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Back Leg
  ctx.save();
  ctx.translate(-4, -28);
  ctx.rotate(-legAngle);
  drawLeg(ctx, colors.pants, 8, 26);
  // Back Foot / Sneaker
  ctx.translate(0, 26);
  ctx.rotate(Math.max(-0.4, legAngle * 0.5));
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  // 3. Backpack (peeking behind torso)
  ctx.fillStyle = colors.backpack;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-22, -60, 14, 26, 4);
  ctx.fill();
  ctx.stroke();

  // 4. Torso & Hoodie
  drawTorso(ctx, colors);

  // 5. Front Leg
  ctx.save();
  ctx.translate(4, -28);
  ctx.rotate(legAngle);
  drawLeg(ctx, colors.pants, 8, 26);
  // Front Foot / Sneaker
  ctx.translate(0, 26);
  ctx.rotate(Math.max(-0.4, -legAngle * 0.5));
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  // 6. Front Arm
  ctx.save();
  ctx.translate(6, -52);
  ctx.rotate(armAngle);
  drawLimb(ctx, colors.hoodie, '#000', 8, 24);
  // Wristband
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-4, 18, 8, 4);
  // Front Hand (clenched fist)
  ctx.fillStyle = '#fcd34d';
  ctx.beginPath();
  ctx.arc(0, 24, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 7. Head & Cap
  drawHead(ctx, colors, 0, -62, 0.05);

  ctx.restore();
}

/**
 * JUMPING ANIMATION
 */
function drawJumpPose(
  ctx: CanvasRenderingContext2D,
  colors: CharacterSkin['colors'],
  _animTime: number
) {
  ctx.save();
  ctx.translate(0, -6);

  // Legs tucked in forward motion
  // Back Leg
  ctx.save();
  ctx.translate(-6, -26);
  ctx.rotate(-0.8);
  drawLeg(ctx, colors.pants, 8, 22);
  ctx.translate(0, 22);
  ctx.rotate(1.2);
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  // Backpack
  ctx.fillStyle = colors.backpack;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-24, -58, 14, 26, 4);
  ctx.fill();
  ctx.stroke();

  // Torso
  drawTorso(ctx, colors);

  // Front Leg (pulled up higher)
  ctx.save();
  ctx.translate(6, -26);
  ctx.rotate(0.9);
  drawLeg(ctx, colors.pants, 8, 22);
  ctx.translate(0, 22);
  ctx.rotate(-0.6);
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  // Arms thrust forward/up in hero leap!
  // Back Arm
  ctx.save();
  ctx.translate(-8, -52);
  ctx.rotate(-1.2);
  drawLimb(ctx, colors.hoodie, '#000', 7, 24);
  ctx.restore();

  // Front Arm (thrusting forward)
  ctx.save();
  ctx.translate(8, -52);
  ctx.rotate(1.3);
  drawLimb(ctx, colors.hoodie, '#000', 8, 24);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-4, 18, 8, 4);
  ctx.fillStyle = '#fcd34d';
  ctx.beginPath();
  ctx.arc(0, 24, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Head tilted forward
  drawHead(ctx, colors, 4, -62, 0.15);

  ctx.restore();
}

/**
 * DOUBLE JUMP ANIMATION (Mid-Air Spin!)
 */
function drawDoubleJumpPose(
  ctx: CanvasRenderingContext2D,
  colors: CharacterSkin['colors'],
  animTime: number
) {
  const spin = animTime * 14; // rapid flip
  ctx.save();
  ctx.translate(0, -40);
  ctx.rotate(spin);

  // Draw tuck ball pose
  ctx.fillStyle = colors.pants;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 10, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors.hoodie;
  ctx.beginPath();
  ctx.arc(0, -6, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawHead(ctx, colors, 6, -18, 0.2);

  // Shoes tucked
  ctx.save();
  ctx.translate(-12, 18);
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.translate(14, 0);
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  ctx.restore();
}

/**
 * SLIDING POSE (Low profile ground slide)
 */
function drawSlidingPose(
  ctx: CanvasRenderingContext2D,
  colors: CharacterSkin['colors'],
  _animTime: number
) {
  ctx.save();
  ctx.translate(0, 2);

  // Body angled backwards, sliding horizontally
  ctx.rotate(-0.35);

  // Back leg extended forward
  ctx.save();
  ctx.translate(10, -14);
  ctx.rotate(1.35);
  drawLeg(ctx, colors.pants, 8, 28);
  ctx.translate(0, 28);
  ctx.rotate(-1.1);
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  // Back arm balancing on floor
  ctx.save();
  ctx.translate(-24, -28);
  ctx.rotate(-1.2);
  drawLimb(ctx, colors.hoodie, '#000', 7, 24);
  ctx.fillStyle = '#fcd34d';
  ctx.beginPath();
  ctx.arc(0, 24, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Backpack
  ctx.fillStyle = colors.backpack;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-26, -34, 16, 22, 4);
  ctx.fill();
  ctx.stroke();

  // Torso low
  ctx.save();
  ctx.translate(-8, 12);
  drawTorso(ctx, colors);
  ctx.restore();

  // Front Leg bent
  ctx.save();
  ctx.translate(0, -10);
  ctx.rotate(0.9);
  drawLeg(ctx, colors.pants, 8, 26);
  ctx.translate(0, 26);
  ctx.rotate(-0.8);
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  // Front arm balancing forward
  ctx.save();
  ctx.translate(4, -30);
  ctx.rotate(0.7);
  drawLimb(ctx, colors.hoodie, '#000', 8, 22);
  ctx.fillStyle = '#fcd34d';
  ctx.beginPath();
  ctx.arc(0, 22, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Head tilted forward looking ahead
  drawHead(ctx, colors, 6, -38, 0.4);

  ctx.restore();
}

/**
 * CRASH / GAME OVER POSE
 */
function drawCrashPose(
  ctx: CanvasRenderingContext2D,
  colors: CharacterSkin['colors'],
  _animTime: number
) {
  ctx.save();
  ctx.rotate(-0.7); // tumbling backwards
  ctx.translate(-15, -15);

  drawTorso(ctx, colors);

  // Legs flailing
  ctx.save();
  ctx.translate(-6, -26);
  ctx.rotate(-1.2);
  drawLeg(ctx, colors.pants, 8, 24);
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  ctx.save();
  ctx.translate(6, -26);
  ctx.rotate(-0.4);
  drawLeg(ctx, colors.pants, 8, 24);
  drawSneaker(ctx, colors.shoes, colors.shoeSoles);
  ctx.restore();

  // Arms thrown out
  ctx.save();
  ctx.translate(-8, -52);
  ctx.rotate(-2.2);
  drawLimb(ctx, colors.hoodie, '#000', 7, 24);
  ctx.restore();

  ctx.save();
  ctx.translate(8, -52);
  ctx.rotate(2.0);
  drawLimb(ctx, colors.hoodie, '#000', 7, 24);
  ctx.restore();

  // Head back with spiral eyes
  drawHead(ctx, colors, -6, -64, -0.2, true);

  ctx.restore();
}

/**
 * SUB-COMPONENTS
 */

function drawTorso(ctx: CanvasRenderingContext2D, colors: CharacterSkin['colors']) {
  ctx.save();
  ctx.translate(0, -52);

  // Hoodie Body
  ctx.fillStyle = colors.hoodie;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.roundRect(-12, 0, 24, 26, [4, 4, 3, 3]);
  ctx.fill();
  ctx.stroke();

  // Inner shirt / zip v-line
  ctx.fillStyle = colors.innerShirt;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.lineTo(0, 12);
  ctx.closePath();
  ctx.fill();

  // Hoodie zipper line & pocket
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.lineTo(0, 26);
  ctx.stroke();

  // Hoodie pocket pouch
  ctx.strokeStyle = '#991b1b'; // darker red contour
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-8, 16, 16, 8, 3);
  ctx.stroke();

  // Backpack strap across chest
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.lineTo(-4, 24);
  ctx.stroke();

  ctx.restore();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  colors: CharacterSkin['colors'],
  hx: number,
  hy: number,
  headTilt: number,
  isDizzy: boolean = false
) {
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(headTilt);

  // 1. Spiky hair behind neck
  ctx.fillStyle = colors.hair;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-20, 6);
  ctx.lineTo(-14, 8);
  ctx.lineTo(-18, 14);
  ctx.lineTo(-10, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. Face shape
  ctx.fillStyle = '#fef08a'; // skin light tone
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cheeks (blush)
  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.arc(8, 4, 3, 0, Math.PI * 2);
  ctx.arc(-8, 4, 3, 0, Math.PI * 2);
  ctx.fill();

  if (isDizzy) {
    // Spiral dizzy eyes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    // Left eye spiral
    drawSpiral(ctx, -6, -2, 4);
    drawSpiral(ctx, 6, -2, 4);

    // Wavy open mouth
    ctx.beginPath();
    ctx.moveTo(-5, 6);
    ctx.quadraticCurveTo(0, 3, 5, 6);
    ctx.stroke();
  } else {
    // Determined cartoon eyes looking right
    // Left eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-4, -1, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-2, -1, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(6, -1, 4.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(8, -1, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights (sparkle)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-1, -2, 1, 0, Math.PI * 2);
    ctx.arc(9, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Confident smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(4, 4, 5, 0.1, Math.PI * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White teeth flash
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.rect(1, 4, 6, 2);
    ctx.fill();
  }

  // 3. Hair bangs
  ctx.fillStyle = colors.hair;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(-4, -2);
  ctx.lineTo(-2, -7);
  ctx.lineTo(6, -1);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Red & White Baseball Cap (worn backwards / angled)
  ctx.fillStyle = colors.cap;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;

  // Cap dome
  ctx.beginPath();
  ctx.arc(0, -9, 14.5, Math.PI * 0.95, Math.PI * 2.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cap front panel (White in default skin)
  ctx.fillStyle = colors.capFront;
  ctx.beginPath();
  ctx.arc(0, -9, 14, Math.PI * 1.35, Math.PI * 1.85);
  ctx.closePath();
  ctx.fill();

  // Cap brim visor sticking backwards/sideways
  ctx.fillStyle = colors.cap;
  ctx.beginPath();
  ctx.ellipse(-14, -7, 8, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cap button on top
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, -23, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawSpiral(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  for (let i = 0; i < 20; i++) {
    const angle = 0.3 * i;
    const r = (radius / 20) * i;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
  height: number
) {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-width / 2, 0, width, height, 4);
  ctx.fill();
  ctx.stroke();
}

function drawLimb(
  ctx: CanvasRenderingContext2D,
  fillColor: string,
  strokeColor: string,
  width: number,
  height: number
) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-width / 2, 0, width, height, 4);
  ctx.fill();
  ctx.stroke();
}

function drawSneaker(
  ctx: CanvasRenderingContext2D,
  shoeColor: string,
  soleColor: string
) {
  ctx.save();
  // Sneaker body (red)
  ctx.fillStyle = shoeColor;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.lineTo(12, -4);
  ctx.lineTo(14, 4);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White rubber sole
  ctx.fillStyle = soleColor;
  ctx.fillRect(-8, 4, 23, 4);
  ctx.strokeRect(-8, 4, 23, 4);

  // White toe cap & laces
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(10, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * POWER-UP AURAS
 */
function drawPowerUpAura(
  ctx: CanvasRenderingContext2D,
  activePowerUps: PowerUpActive[],
  animTime: number
) {
  for (const pup of activePowerUps) {
    if (pup.type === 'MULTIPLIER') {
      // Golden glowing ring & aura
      const pulse = 1 + Math.sin(animTime * 10) * 0.15;
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -42, 38 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Floating x2 text
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px "Titan One", sans-serif';
      ctx.fillText('2X', 28, -60 + Math.sin(animTime * 8) * 4);
      ctx.restore();
    }

    if (pup.type === 'MAGNET') {
      // Blue electrical magnetic pulse
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) {
        const offset = (animTime * 4 + i * 0.6) % 2;
        ctx.beginPath();
        ctx.arc(0, -42, 25 + offset * 18, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (pup.type === 'SUPER_JUMP') {
      // Winged sneaker / jet flame glow
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      for (let i = 0; i < 5; i++) {
        const py = Math.random() * 8;
        const px = -10 - Math.random() * 12;
        ctx.beginPath();
        ctx.arc(px, py, 3 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

function drawPowerUpForeground(
  ctx: CanvasRenderingContext2D,
  activePowerUps: PowerUpActive[],
  animTime: number
) {
  const shield = activePowerUps.find(p => p.type === 'SHIELD');
  if (shield) {
    // Energy shield sphere
    ctx.save();
    const pulse = 1 + Math.sin(animTime * 8) * 0.05;
    const grad = ctx.createRadialGradient(0, -45, 10, 0, -45, 48 * pulse);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
    grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.25)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -45, 48 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hexagonal circuit highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -45, 44 * pulse, animTime * 2, animTime * 2 + 1.2);
    ctx.stroke();

    ctx.restore();
  }
}
