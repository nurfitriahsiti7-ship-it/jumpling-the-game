import { Particle, FloatingText } from './types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private nextTextId: number = 1;

  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.shape === 'confetti') {
        p.vy += 220 * dt; // gravity
        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot * dt;
        }
      } else if (p.shape === 'spark') {
        p.vy += 300 * dt; // gravity on sparks
      }
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += dt;
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
      ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      ft.scale = Math.min(1.2, 0.6 + (ft.life / ft.maxLife) * 0.8);
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Draw particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        this.drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.45);
      } else if (p.shape === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // default circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw floating texts
    ctx.font = 'bold 18px "Titan One", sans-serif';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      // Black outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, 0, 0);

      // Fill color
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  // --- Emitters ---

  public emitCoinSparkles(x: number, y: number) {
    const colors = ['#fde047', '#f59e0b', '#ffffff', '#fbbf24'];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.25,
        shape: Math.random() > 0.4 ? 'star' : 'circle',
      });
    }
  }

  public emitJumpDust(x: number, y: number) {
    for (let i = 0; i < 7; i++) {
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y - 2,
        vx: -60 - Math.random() * 80,
        vy: -20 - Math.random() * 40,
        size: 5 + Math.random() * 6,
        color: 'rgba(226, 232, 240, 0.7)',
        alpha: 0.8,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.15,
        shape: 'circle',
      });
    }
  }

  public emitDoubleJumpRing(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const speed = 100 + Math.random() * 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: '#38bdf8',
        alpha: 1,
        life: 0,
        maxLife: 0.35,
        shape: 'star',
      });
    }
  }

  public emitSlideSparks(x: number, y: number) {
    const colors = ['#f97316', '#facc15', '#ef4444', '#cbd5e1'];
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + Math.random() * 10 - 5,
        y: y + 2,
        vx: -120 - Math.random() * 120,
        vy: -40 - Math.random() * 60,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.15,
        shape: 'spark',
      });
    }
  }

  public emitCrashDebris(x: number, y: number) {
    const colors = ['#f59e0b', '#dc2626', '#1e293b', '#e2e8f0', '#78350f'];
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 240;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
        shape: 'confetti',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10,
      });
    }
  }

  public emitShieldBreak(x: number, y: number) {
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const speed = 120 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: '#38bdf8',
        alpha: 1,
        life: 0,
        maxLife: 0.4,
        shape: 'star',
      });
    }
  }

  public emitConfetti(width: number, height: number) {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#fde047'];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: -10 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 140,
        vy: 120 + Math.random() * 180,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 2.5 + Math.random() * 1.5,
        shape: 'confetti',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#fde047') {
    this.floatingTexts.push({
      id: this.nextTextId++,
      text,
      x,
      y,
      color,
      alpha: 1,
      scale: 0.6,
      vy: -55,
      life: 0,
      maxLife: 0.85,
    });
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}
