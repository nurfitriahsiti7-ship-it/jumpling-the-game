import {
  CharacterAction,
  CharacterSkin,
  Coin,
  Obstacle,
  PowerUpActive,
  PowerUpItem,
  PowerUpType,
} from './types';
import { ParticleSystem } from './particles';
import { drawCharacter } from './characterArt';
import { soundEngine } from './audio';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, distance: number, coins: number, multiplier: number) => void;
  onGameOver: (score: number, distance: number, coins: number, stats: RunStats) => void;
  onPowerUpChange: (active: PowerUpActive[]) => void;
  onSpeedMilestone?: (milestone: string) => void;
}

export interface RunStats {
  distance: number;
  coins: number;
  doubleJumps: number;
  slidesUnderObstacle: number;
  powerUpsCollected: number;
  score: number;
}

export class GameEngine {
  // Virtual resolution
  public readonly V_WIDTH = 1200;
  public readonly V_HEIGHT = 650;
  public readonly GROUND_Y = 520;

  // Player properties
  private playerX = 140;
  private playerY = 520;
  private playerVy = 0;
  private isGrounded = true;
  private canDoubleJump = false;
  private action: CharacterAction = 'RUN';
  private slideTimer = 0;
  private readonly SLIDE_DURATION = 0.65;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private invincibilityTimer = 0;

  // Player hitbox dimensions
  private readonly NORMAL_WIDTH = 52;
  private readonly NORMAL_HEIGHT = 82;
  private readonly SLIDE_HEIGHT = 38;

  // Game metrics & state
  private isRunning = false;
  private isPaused = false;
  private animTime = 0;
  private gameDistance = 0; // in meters
  private distanceTraveledPx = 0;
  private coinsCollected = 0;
  private baseSpeed = 430;
  private currentSpeed = 430;
  private score = 0;
  private scoreMultiplier = 1;
  private lastMilestoneDistance = 0;

  // Stats for missions
  private runStats: RunStats = {
    distance: 0,
    coins: 0,
    doubleJumps: 0,
    slidesUnderObstacle: 0,
    powerUpsCollected: 0,
    score: 0,
  };

  // Entities
  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private powerUpItems: PowerUpItem[] = [];
  private activePowerUps: PowerUpActive[] = [];
  private particles: ParticleSystem = new ParticleSystem();

  // Spawners & Timing
  private spawnDistanceCounter = 0;
  private nextObstacleDistance = 350;
  private nextPowerUpDistance = 1400;
  private nextCoinId = 1;
  private nextObstacleId = 1;
  private nextPowerUpId = 1;

  // Camera & Juice
  private cameraShakeTime = 0;
  private cameraShakeIntensity = 0;
  private hitstopTimer = 0;

  // Active Skin
  private currentSkin: CharacterSkin;

  // Callbacks
  private callbacks: GameEngineCallbacks;

  // Background Parallax Offsets
  private bgCloudOffset = 0;
  private bgFarCityOffset = 0;
  private bgMidCityOffset = 0;
  private bgNearCityOffset = 0;
  private bgGroundOffset = 0;
  private ambientTrainX = -600;
  private ambientTrainTimer = 4;

  constructor(skin: CharacterSkin, callbacks: GameEngineCallbacks) {
    this.currentSkin = skin;
    this.callbacks = callbacks;
    this.reset();
  }

  public setSkin(skin: CharacterSkin) {
    this.currentSkin = skin;
  }

  public reset() {
    this.playerX = 140;
    this.playerY = this.GROUND_Y;
    this.playerVy = 0;
    this.isGrounded = true;
    this.canDoubleJump = true;
    this.action = 'RUN';
    this.slideTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.invincibilityTimer = 0;

    this.isRunning = false;
    this.isPaused = false;
    this.animTime = 0;
    this.gameDistance = 0;
    this.distanceTraveledPx = 0;
    this.coinsCollected = 0;
    this.currentSpeed = this.baseSpeed;
    this.score = 0;
    this.scoreMultiplier = 1;
    this.lastMilestoneDistance = 0;

    this.runStats = {
      distance: 0,
      coins: 0,
      doubleJumps: 0,
      slidesUnderObstacle: 0,
      powerUpsCollected: 0,
      score: 0,
    };

    this.obstacles = [];
    this.coins = [];
    this.powerUpItems = [];
    this.activePowerUps = [];
    this.particles.clear();

    this.spawnDistanceCounter = 0;
    this.nextObstacleDistance = 380;
    this.nextPowerUpDistance = 1200;

    this.cameraShakeTime = 0;
    this.cameraShakeIntensity = 0;
    this.hitstopTimer = 0;

    this.ambientTrainX = -600;
    this.ambientTrainTimer = 5;
  }

  public start() {
    this.reset();
    this.isRunning = true;
    this.isPaused = false;
    soundEngine.startMusic();
  }

  public pause() {
    this.isPaused = true;
    soundEngine.stopMusic();
  }

  public resume() {
    this.isPaused = false;
    soundEngine.startMusic();
  }

  public stop() {
    this.isRunning = false;
    soundEngine.stopMusic();
  }

  // --- Input Handlers ---

  public handleJump() {
    if (!this.isRunning || this.isPaused || this.action === 'CRASH') return;

    // If sliding on ground, cancel slide and jump immediately
    if (this.action === 'SLIDE') {
      this.slideTimer = 0;
    }

    const hasSuperJump = this.activePowerUps.some(p => p.type === 'SUPER_JUMP');
    const jumpVel = hasSuperJump ? -940 : -780;

    // Ground jump or coyote jump
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.playerVy = jumpVel;
      this.isGrounded = false;
      this.canDoubleJump = true;
      this.coyoteTimer = 0;
      this.action = 'JUMP';
      this.particles.emitJumpDust(this.playerX + this.NORMAL_WIDTH / 2, this.playerY);
      soundEngine.playJump();
      return;
    }

    // Mid-air double jump!
    if (this.canDoubleJump) {
      this.playerVy = jumpVel * 0.9;
      this.canDoubleJump = false;
      this.action = 'DOUBLE_JUMP';
      this.runStats.doubleJumps++;
      this.particles.emitDoubleJumpRing(
        this.playerX + this.NORMAL_WIDTH / 2,
        this.playerY - this.NORMAL_HEIGHT / 2
      );
      this.particles.addFloatingText(
        'DOUBLE JUMP!',
        this.playerX + this.NORMAL_WIDTH / 2,
        this.playerY - this.NORMAL_HEIGHT,
        '#38bdf8'
      );
      soundEngine.playDoubleJump();
      return;
    }

    // Buffer jump input if near ground
    this.jumpBufferTimer = 0.12;
  }

  public handleSlide() {
    if (!this.isRunning || this.isPaused || this.action === 'CRASH') return;

    if (this.isGrounded) {
      this.action = 'SLIDE';
      this.slideTimer = this.SLIDE_DURATION;
      this.particles.emitSlideSparks(this.playerX + this.NORMAL_WIDTH / 2, this.playerY);
      soundEngine.playSlide();
    } else {
      // In mid-air: slam/fast-fall down rapidly!
      this.playerVy = Math.max(this.playerVy, 1100);
      this.action = 'SLIDE';
      this.slideTimer = this.SLIDE_DURATION;
      soundEngine.playSlide();
    }
  }

  // --- Main Update Loop ---

  public update(rawDt: number) {
    if (!this.isRunning || this.isPaused) return;

    // Clamp dt to avoid physics tunnelling
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze frame
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    this.animTime += dt;

    // Camera shake decay
    if (this.cameraShakeTime > 0) {
      this.cameraShakeTime -= dt;
    }

    // Invincibility blink decay
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= dt;
    }

    // Update active power-ups
    this.updatePowerUps(dt);

    // Dynamic speed ramp with distance
    this.currentSpeed = this.baseSpeed + Math.min(this.gameDistance * 0.42, 480);

    // Speed milestones announcements
    const currentMilestone = Math.floor(this.gameDistance / 250);
    if (currentMilestone > this.lastMilestoneDistance && currentMilestone > 0) {
      this.lastMilestoneDistance = currentMilestone;
      const speedFactor = (this.currentSpeed / this.baseSpeed).toFixed(1);
      this.particles.addFloatingText(
        `SPEED UP! ${speedFactor}X`,
        this.playerX + 120,
        this.playerY - 100,
        '#f59e0b'
      );
      soundEngine.playSpeedUp();
      if (this.callbacks.onSpeedMilestone) {
        this.callbacks.onSpeedMilestone(`${speedFactor}X`);
      }
    }

    const moveStep = this.currentSpeed * dt;
    this.distanceTraveledPx += moveStep;
    this.gameDistance = Math.floor(this.distanceTraveledPx / 20); // 20px = 1m
    this.runStats.distance = this.gameDistance;

    // Calculate score
    const hasMultiplier = this.activePowerUps.some(p => p.type === 'MULTIPLIER');
    this.scoreMultiplier = hasMultiplier ? 2 : 1;
    this.score = Math.floor(
      this.gameDistance * 1.5 + this.coinsCollected * 15 * this.scoreMultiplier
    );
    this.runStats.score = this.score;

    this.callbacks.onScoreUpdate(
      this.score,
      this.gameDistance,
      this.coinsCollected,
      this.scoreMultiplier
    );

    // Parallax background offsets
    this.bgCloudOffset = (this.bgCloudOffset + moveStep * 0.08) % this.V_WIDTH;
    this.bgFarCityOffset = (this.bgFarCityOffset + moveStep * 0.18) % this.V_WIDTH;
    this.bgMidCityOffset = (this.bgMidCityOffset + moveStep * 0.42) % this.V_WIDTH;
    this.bgNearCityOffset = (this.bgNearCityOffset + moveStep * 0.75) % this.V_WIDTH;
    this.bgGroundOffset = (this.bgGroundOffset + moveStep) % 60;

    // Ambient background train
    this.updateAmbientTrain(dt, moveStep);

    // Player physics & jumping
    this.updatePlayerPhysics(dt);

    // Slide state management
    if (this.action === 'SLIDE') {
      this.slideTimer -= dt;
      if (this.isGrounded) {
        this.particles.emitSlideSparks(this.playerX + this.NORMAL_WIDTH * 0.6, this.playerY);
      }
      if (this.slideTimer <= 0) {
        this.action = this.isGrounded ? 'RUN' : 'JUMP';
      }
    }

    // Input buffering for jump
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
      if (this.isGrounded) {
        this.handleJump();
        this.jumpBufferTimer = 0;
      }
    }

    // Spawner updates
    this.updateSpawners(moveStep);

    // Obstacles movement & collision
    this.updateObstacles(moveStep);

    // Coins movement, magnet attraction & collection
    this.updateCoins(moveStep, dt);

    // Power-up items movement & pickup
    this.updatePowerUpItems(moveStep);

    // Particles update
    this.particles.update(dt);
  }

  // --- Physics & Collision ---

  private updatePlayerPhysics(dt: number) {
    const gravity = 1900;
    this.playerVy += gravity * dt;
    this.playerY += this.playerVy * dt;

    // Check platform collision (e.g. running on train rooftop!)
    let landedOnObstacle = false;
    const playerWidth = this.NORMAL_WIDTH;
    const playerBottom = this.playerY;

    for (const obs of this.obstacles) {
      if (obs.solidTop && this.playerVy >= 0) {
        const obsLeft = obs.x;
        const obsRight = obs.x + obs.width;
        const obsTop = obs.y;

        // Check if player feet landed near top of obstacle
        if (
          this.playerX + playerWidth > obsLeft + 10 &&
          this.playerX < obsRight - 10 &&
          playerBottom >= obsTop &&
          playerBottom <= obsTop + 24
        ) {
          this.playerY = obsTop;
          this.playerVy = 0;
          this.isGrounded = true;
          this.canDoubleJump = true;
          landedOnObstacle = true;
          if (this.action === 'JUMP' || this.action === 'DOUBLE_JUMP') {
            this.action = 'RUN';
            this.particles.emitJumpDust(this.playerX + playerWidth / 2, this.playerY);
          }
          break;
        }
      }
    }

    // Ground check
    if (!landedOnObstacle) {
      if (this.playerY >= this.GROUND_Y) {
        this.playerY = this.GROUND_Y;
        this.playerVy = 0;
        if (!this.isGrounded) {
          this.isGrounded = true;
          this.canDoubleJump = true;
          if (this.action === 'JUMP' || this.action === 'DOUBLE_JUMP') {
            this.action = 'RUN';
            this.particles.emitJumpDust(this.playerX + this.NORMAL_WIDTH / 2, this.playerY);
          }
        }
      } else {
        // In mid-air
        if (this.isGrounded) {
          // just left ground - start coyote timer
          this.coyoteTimer = 0.09;
        }
        this.isGrounded = false;
        if (this.coyoteTimer > 0) {
          this.coyoteTimer -= dt;
        }
        if (this.action !== 'SLIDE' && this.action !== 'DOUBLE_JUMP') {
          this.action = 'JUMP';
        }
      }
    }
  }

  private updateObstacles(moveStep: number) {
    const isSliding = this.action === 'SLIDE';
    const playerBox = {
      x: this.playerX + 8,
      y: isSliding ? this.playerY - this.SLIDE_HEIGHT : this.playerY - this.NORMAL_HEIGHT,
      width: this.NORMAL_WIDTH - 16,
      height: isSliding ? this.SLIDE_HEIGHT : this.NORMAL_HEIGHT,
    };

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= moveStep;

      // Obstacle offscreen
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
        continue;
      }

      // Check if player successfully slid under low overhead obstacle
      if (obs.type === 'LOW_OVERHEAD_SIGN' && !obs.scored) {
        if (obs.x + obs.width < this.playerX) {
          obs.scored = true;
          if (isSliding) {
            this.runStats.slidesUnderObstacle++;
            this.particles.addFloatingText(
              'SLICK SLIDE! +50',
              this.playerX + 50,
              this.playerY - 80,
              '#10b981'
            );
          }
        }
      }

      // Collision detection
      if (this.invincibilityTimer <= 0) {
        const obsBox = {
          x: obs.x + 6,
          y: obs.y,
          width: obs.width - 12,
          height: obs.height,
        };

        // Solid top platforms don't collide if player is standing safely on top
        if (obs.solidTop && this.playerY <= obs.y + 4) {
          continue;
        }

        if (this.checkAABB(playerBox, obsBox)) {
          // Check if active SHIELD saves the player
          const shieldIdx = this.activePowerUps.findIndex(p => p.type === 'SHIELD');
          if (shieldIdx !== -1) {
            // Shield absorbed the hit!
            this.activePowerUps.splice(shieldIdx, 1);
            this.callbacks.onPowerUpChange(this.activePowerUps);
            this.invincibilityTimer = 1.4;
            this.triggerCameraShake(0.3, 12);
            this.particles.emitShieldBreak(this.playerX + 25, this.playerY - 40);
            this.particles.addFloatingText(
              'SHIELD BROKEN!',
              this.playerX + 40,
              this.playerY - 80,
              '#38bdf8'
            );
            soundEngine.playShieldBreak();
            // Remove the obstacle so player isn't stuck
            this.obstacles.splice(i, 1);
            continue;
          }

          // Crash!
          this.handleCrash();
          return;
        }
      }
    }
  }

  private handleCrash() {
    this.action = 'CRASH';
    this.hitstopTimer = 0.06;
    this.triggerCameraShake(0.6, 22);
    this.particles.emitCrashDebris(this.playerX + 30, this.playerY - 30);
    soundEngine.playHit();
    soundEngine.playGameOver();

    // End run after brief animation settling
    window.setTimeout(() => {
      this.isRunning = false;
      this.callbacks.onGameOver(
        this.score,
        this.gameDistance,
        this.coinsCollected,
        this.runStats
      );
    }, 600);
  }

  private updateCoins(moveStep: number, dt: number) {
    const hasMagnet = this.activePowerUps.some(p => p.type === 'MAGNET');
    const magnetRadius = 340;
    const playerCenterX = this.playerX + this.NORMAL_WIDTH / 2;
    const playerCenterY = this.playerY - (this.action === 'SLIDE' ? this.SLIDE_HEIGHT / 2 : this.NORMAL_HEIGHT / 2);

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.x -= moveStep;
      coin.rotation = (coin.rotation + dt * 4.5) % (Math.PI * 2);

      // Magnet pull
      if (hasMagnet) {
        const dx = playerCenterX - coin.x;
        const dy = playerCenterY - coin.y;
        const dist = Math.hypot(dx, dy);

        if (dist < magnetRadius) {
          const pullSpeed = 700 * dt;
          coin.x += (dx / dist) * pullSpeed;
          coin.y += (dy / dist) * pullSpeed;
        }
      }

      // Coin offscreen
      if (coin.x < -40) {
        this.coins.splice(i, 1);
        continue;
      }

      // Collection check
      const distToPlayer = Math.hypot(playerCenterX - coin.x, playerCenterY - coin.y);
      if (distToPlayer < 42) {
        coin.collected = true;
        const coinVal = this.scoreMultiplier > 1 ? 2 : 1;
        this.coinsCollected += coinVal;
        this.runStats.coins = this.coinsCollected;

        this.particles.emitCoinSparkles(coin.x, coin.y);
        soundEngine.playCoin();
        if (coinVal > 1) {
          this.particles.addFloatingText('+2', coin.x, coin.y, '#f59e0b');
        }

        this.coins.splice(i, 1);
      }
    }
  }

  private updatePowerUpItems(moveStep: number) {
    const playerCenterX = this.playerX + this.NORMAL_WIDTH / 2;
    const playerCenterY = this.playerY - (this.action === 'SLIDE' ? this.SLIDE_HEIGHT / 2 : this.NORMAL_HEIGHT / 2);

    for (let i = this.powerUpItems.length - 1; i >= 0; i--) {
      const item = this.powerUpItems[i];
      item.x -= moveStep;
      item.pulse = (item.pulse + 0.05) % (Math.PI * 2);

      if (item.x + item.width < -60) {
        this.powerUpItems.splice(i, 1);
        continue;
      }

      // Pickup check
      const dist = Math.hypot(playerCenterX - (item.x + item.width / 2), playerCenterY - (item.y + item.height / 2));
      if (dist < 48) {
        this.activatePowerUp(item.type);
        this.runStats.powerUpsCollected++;
        this.particles.emitCoinSparkles(item.x + item.width / 2, item.y + item.height / 2);
        soundEngine.playPowerUp();
        this.powerUpItems.splice(i, 1);
      }
    }
  }

  private activatePowerUp(type: PowerUpType) {
    const durations: Record<PowerUpType, number> = {
      MAGNET: 12,
      SHIELD: 15,
      MULTIPLIER: 14,
      SUPER_JUMP: 10,
    };

    const maxDuration = durations[type];
    const existing = this.activePowerUps.find(p => p.type === type);
    if (existing) {
      existing.duration = maxDuration;
    } else {
      this.activePowerUps.push({
        type,
        duration: maxDuration,
        maxDuration,
      });
    }

    const labels: Record<PowerUpType, string> = {
      MAGNET: 'MAGNET ACTIVATED!',
      SHIELD: 'SHIELD CHARGED!',
      MULTIPLIER: '2X SCORE BOOST!',
      SUPER_JUMP: 'SUPER SNEAKERS!',
    };

    const colors: Record<PowerUpType, string> = {
      MAGNET: '#38bdf8',
      SHIELD: '#06b6d4',
      MULTIPLIER: '#f59e0b',
      SUPER_JUMP: '#ef4444',
    };

    this.particles.addFloatingText(
      labels[type],
      this.playerX + 80,
      this.playerY - 110,
      colors[type]
    );

    this.callbacks.onPowerUpChange([...this.activePowerUps]);
  }

  private updatePowerUps(dt: number) {
    let changed = false;
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const p = this.activePowerUps[i];
      p.duration -= dt;
      if (p.duration <= 0) {
        this.activePowerUps.splice(i, 1);
        changed = true;
      }
    }
    if (changed) {
      this.callbacks.onPowerUpChange([...this.activePowerUps]);
    }
  }

  // --- Spawner Logic ---

  private updateSpawners(moveStep: number) {
    this.spawnDistanceCounter += moveStep;

    // Obstacle spawn
    if (this.spawnDistanceCounter >= this.nextObstacleDistance) {
      this.spawnDistanceCounter = 0;
      // Distance between obstacles decreases slightly with speed for tighter challenge
      this.nextObstacleDistance = 380 + Math.random() * 220 - Math.min(this.gameDistance * 0.15, 100);
      this.spawnRandomObstaclePattern();
    }

    // Power-up item spawn
    if (this.distanceTraveledPx >= this.nextPowerUpDistance) {
      this.nextPowerUpDistance = this.distanceTraveledPx + 1400 + Math.random() * 800;
      this.spawnRandomPowerUp();
    }
  }

  private spawnRandomObstaclePattern() {
    const patterns = [
      'CRATE_SINGLE',
      'CRATE_DOUBLE',
      'ROAD_BARRIER',
      'LOW_OVERHEAD',
      'TRAIN_CAR',
      'BARRIER_AND_COIN_ARC',
    ];

    // Pick pattern weighted by current distance
    let chosen = patterns[Math.floor(Math.random() * patterns.length)];
    // Early game: ease in with simpler obstacles
    if (this.gameDistance < 120 && (chosen === 'TRAIN_CAR' || chosen === 'LOW_OVERHEAD')) {
      chosen = 'CRATE_SINGLE';
    }

    const spawnX = this.V_WIDTH + 60;

    switch (chosen) {
      case 'CRATE_SINGLE': {
        this.obstacles.push({
          id: this.nextObstacleId++,
          type: 'CRATE',
          x: spawnX,
          y: this.GROUND_Y - 52,
          width: 52,
          height: 52,
        });
        this.spawnCoinArc(spawnX - 40, spawnX + 120, this.GROUND_Y - 140, 5);
        break;
      }

      case 'CRATE_DOUBLE': {
        this.obstacles.push({
          id: this.nextObstacleId++,
          type: 'DOUBLE_CRATE',
          x: spawnX,
          y: this.GROUND_Y - 96,
          width: 52,
          height: 96,
        });
        this.spawnCoinArc(spawnX - 50, spawnX + 130, this.GROUND_Y - 170, 6);
        break;
      }

      case 'ROAD_BARRIER': {
        this.obstacles.push({
          id: this.nextObstacleId++,
          type: 'ROAD_BARRIER',
          x: spawnX,
          y: this.GROUND_Y - 62,
          width: 66,
          height: 62,
        });
        this.spawnCoinArc(spawnX - 40, spawnX + 120, this.GROUND_Y - 150, 5);
        break;
      }

      case 'LOW_OVERHEAD': {
        // High overhead clearance sign — MUST SLIDE UNDER!
        // Clearance is 48px from ground:
        // Top sign is at y = GROUND_Y - 145, height = 98 (ends at GROUND_Y - 47)
        this.obstacles.push({
          id: this.nextObstacleId++,
          type: 'LOW_OVERHEAD_SIGN',
          x: spawnX,
          y: this.GROUND_Y - 145,
          width: 80,
          height: 98,
        });
        // Low trail of coins to reward sliding
        for (let c = 0; c < 5; c++) {
          this.coins.push({
            id: this.nextCoinId++,
            x: spawnX - 30 + c * 40,
            y: this.GROUND_Y - 20,
            radius: 12,
            collected: false,
            rotation: 0,
          });
        }
        break;
      }

      case 'TRAIN_CAR': {
        // Train carriage with solid roof player can run on
        const trainWidth = 240;
        const trainHeight = 100;
        this.obstacles.push({
          id: this.nextObstacleId++,
          type: 'TRAIN_CAR',
          x: spawnX,
          y: this.GROUND_Y - trainHeight,
          width: trainWidth,
          height: trainHeight,
          solidTop: true,
        });
        // Coins along the train rooftop
        for (let c = 0; c < 6; c++) {
          this.coins.push({
            id: this.nextCoinId++,
            x: spawnX + 25 + c * 35,
            y: this.GROUND_Y - trainHeight - 24,
            radius: 12,
            collected: false,
            rotation: 0,
          });
        }
        break;
      }

      case 'BARRIER_AND_COIN_ARC': {
        this.obstacles.push({
          id: this.nextObstacleId++,
          type: 'HAZARD_CONES',
          x: spawnX,
          y: this.GROUND_Y - 48,
          width: 48,
          height: 48,
        });
        this.spawnCoinArc(spawnX - 40, spawnX + 120, this.GROUND_Y - 130, 5);
        break;
      }
    }
  }

  private spawnCoinArc(startX: number, endX: number, apexY: number, count: number) {
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = startX + t * (endX - startX);
      // Parabolic arc y = 4 * apex * t * (1-t)
      const arcHeight = (this.GROUND_Y - 30) - apexY;
      const y = (this.GROUND_Y - 30) - 4 * arcHeight * t * (1 - t);

      this.coins.push({
        id: this.nextCoinId++,
        x,
        y,
        radius: 12,
        collected: false,
        rotation: 0,
      });
    }
  }

  private spawnRandomPowerUp() {
    const types: PowerUpType[] = ['MAGNET', 'SHIELD', 'MULTIPLIER', 'SUPER_JUMP'];
    const chosen = types[Math.floor(Math.random() * types.length)];
    this.powerUpItems.push({
      id: this.nextPowerUpId++,
      type: chosen,
      x: this.V_WIDTH + 50,
      y: this.GROUND_Y - 120,
      width: 42,
      height: 42,
      collected: false,
      pulse: 0,
    });
  }

  private updateAmbientTrain(dt: number, moveStep: number) {
    this.ambientTrainTimer -= dt;
    if (this.ambientTrainTimer <= 0 && this.ambientTrainX < -400) {
      this.ambientTrainX = this.V_WIDTH + 200;
      this.ambientTrainTimer = 8 + Math.random() * 6;
    }
    if (this.ambientTrainX > -500) {
      // Moves left faster than player for dramatic zoom
      this.ambientTrainX -= moveStep * 1.6;
    }
  }

  private triggerCameraShake(duration: number, intensity: number) {
    this.cameraShakeTime = duration;
    this.cameraShakeIntensity = intensity;
  }

  private checkAABB(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // --- Rendering ---

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Camera shake transformation
    if (this.cameraShakeTime > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Sky & Sun/Sunset/Night Dynamic Gradient
    this.drawSky(ctx);

    // 2. Parallax City Layers
    this.drawFarCity(ctx);
    this.drawMidCityAndSubway(ctx);
    this.drawNearCity(ctx);

    // 3. Ground / Roadway / Rails
    this.drawGround(ctx);

    // 4. Power-up floating items
    this.drawPowerUpItems(ctx);

    // 5. Coins
    this.drawCoins(ctx);

    // 6. Obstacles
    this.drawObstacles(ctx);

    // 7. Player Character
    drawCharacter(
      ctx,
      this.playerX,
      this.action === 'SLIDE' ? this.playerY - this.SLIDE_HEIGHT : this.playerY - this.NORMAL_HEIGHT,
      this.NORMAL_WIDTH,
      this.action === 'SLIDE' ? this.SLIDE_HEIGHT : this.NORMAL_HEIGHT,
      this.action,
      this.animTime,
      this.currentSkin,
      this.activePowerUps,
      this.invincibilityTimer > 0
    );

    // 8. Particles & Floating Text
    this.particles.draw(ctx);

    ctx.restore();
  }

  private drawSky(ctx: CanvasRenderingContext2D) {
    // Dynamic transition: Day (0-600m), Sunset (600-1400m), Cyber Night (1400m+)
    const dist = this.gameDistance % 2400;
    const grad = ctx.createLinearGradient(0, 0, 0, this.GROUND_Y);

    if (dist < 800) {
      // Bright vibrant blue sky (just like the artwork!)
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.5, '#7dd3fc');
      grad.addColorStop(1, '#e0f2fe');
    } else if (dist < 1600) {
      // Golden sunset
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.4, '#fb923c');
      grad.addColorStop(0.8, '#fde047');
      grad.addColorStop(1, '#ffedd5');
    } else {
      // Cyber Arcade Night
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.6, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // Sun / Moon
    ctx.save();
    if (dist < 800) {
      // Golden bright sun with rays
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(this.V_WIDTH - 180, 110, 42, 0, Math.PI * 2);
      ctx.fill();
    } else if (dist >= 1600) {
      // Crescent Moon
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(this.V_WIDTH - 180, 110, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(this.V_WIDTH - 192, 106, 28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Fluffy cartoon clouds
    this.drawClouds(ctx);
  }

  private drawClouds(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const cloudPositions = [
      { x: 120, y: 70, scale: 1 },
      { x: 480, y: 110, scale: 0.8 },
      { x: 860, y: 60, scale: 1.2 },
      { x: 1240, y: 90, scale: 0.9 },
    ];

    for (const c of cloudPositions) {
      const cx = (c.x - this.bgCloudOffset + this.V_WIDTH * 2) % (this.V_WIDTH + 200) - 100;
      this.drawPuffyCloud(ctx, cx, c.y, c.scale);
    }
    ctx.restore();
  }

  private drawPuffyCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.arc(22, -8, 28, 0, Math.PI * 2);
    ctx.arc(52, 0, 24, 0, Math.PI * 2);
    ctx.arc(26, 12, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawFarCity(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#94a3b8'; // soft silhouette blue-grey
    ctx.globalAlpha = 0.55;

    const baseOffset = this.bgFarCityOffset;
    const buildingWidth = 70;
    const count = Math.ceil(this.V_WIDTH / buildingWidth) + 3;

    for (let i = 0; i < count; i++) {
      const bx = i * buildingWidth - (baseOffset % buildingWidth);
      // Pseudo-random deterministic heights
      const h = 180 + Math.sin(i * 1.7) * 70 + Math.cos(i * 3.1) * 40;
      ctx.fillRect(bx, this.GROUND_Y - h, buildingWidth - 6, h);

      // Antenna needles
      if (i % 3 === 0) {
        ctx.fillRect(bx + buildingWidth / 2 - 2, this.GROUND_Y - h - 35, 3, 35);
      }
    }
    ctx.restore();
  }

  private drawMidCityAndSubway(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Midground skyscrapers with lit window grids
    const buildingWidth = 95;
    const count = Math.ceil(this.V_WIDTH / buildingWidth) + 3;

    for (let i = 0; i < count; i++) {
      const bx = i * buildingWidth - (this.bgMidCityOffset % buildingWidth);
      const h = 230 + Math.sin(i * 2.3) * 90;
      ctx.fillStyle = i % 2 === 0 ? '#475569' : '#334155';
      ctx.fillRect(bx, this.GROUND_Y - h, buildingWidth - 8, h);

      // Lit windows
      ctx.fillStyle = '#fef08a';
      ctx.globalAlpha = 0.75;
      for (let wy = this.GROUND_Y - h + 20; wy < this.GROUND_Y - 30; wy += 24) {
        for (let wx = bx + 12; wx < bx + buildingWidth - 20; wx += 18) {
          if ((wx + wy) % 5 !== 0) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Elevated Subway Track in midground (like the left of the poster!)
    const trackY = this.GROUND_Y - 180;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, trackY, this.V_WIDTH, 14);

    // Track support pillars
    ctx.fillStyle = '#334155';
    for (let px = 60; px < this.V_WIDTH + 100; px += 180) {
      const screenPx = (px - this.bgMidCityOffset + this.V_WIDTH * 2) % (this.V_WIDTH + 180) - 80;
      ctx.fillRect(screenPx, trackY, 16, this.GROUND_Y - trackY);
      // Cross support
      ctx.fillRect(screenPx - 10, trackY, 36, 6);
    }

    // High-speed ambient red/white commuter train on elevated track!
    if (this.ambientTrainX > -500 && this.ambientTrainX < this.V_WIDTH + 300) {
      this.drawAmbientTrain(ctx, this.ambientTrainX, trackY - 38);
    }

    ctx.restore();
  }

  private drawAmbientTrain(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Train carriages (red & white, matching Subway Surfers vibe)
    const carLength = 160;
    for (let c = 0; c < 3; c++) {
      const cx = c * (carLength + 6);
      // Car body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(cx, 0, carLength, 36, 4);
      ctx.fill();
      ctx.stroke();

      // White stripe
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx, 12, carLength, 12);

      // Windows
      ctx.fillStyle = '#38bdf8';
      for (let w = cx + 16; w < cx + carLength - 20; w += 32) {
        ctx.fillRect(w, 8, 20, 16);
      }
    }

    // Yellow headlight
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 18, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawNearCity(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Trees, streetlamps, billboards with crown logo
    const step = 280;
    const count = Math.ceil(this.V_WIDTH / step) + 2;

    for (let i = 0; i < count; i++) {
      const x = i * step - (this.bgNearCityOffset % step);

      // Billboard with Crown Emblem
      if (i % 3 === 1) {
        this.drawBillboard(ctx, x, this.GROUND_Y - 145);
      } else if (i % 3 === 2) {
        // Lush cartoon tree
        this.drawTree(ctx, x, this.GROUND_Y);
      } else {
        // Modern street light
        this.drawStreetLamp(ctx, x, this.GROUND_Y);
      }
    }
    ctx.restore();
  }

  private drawBillboard(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    // Metal poles
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 12, y + 60, 6, 85);
    ctx.fillRect(x + 72, y + 60, 6, 85);

    // Board background (pink/magenta gradient matching the poster billboard!)
    const bGrad = ctx.createLinearGradient(x, y, x + 90, y + 65);
    bGrad.addColorStop(0, '#f43f5e');
    bGrad.addColorStop(1, '#e11d48');
    ctx.fillStyle = bGrad;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(x, y, 90, 65, 6);
    ctx.fill();
    ctx.stroke();

    // Golden Crown Icon
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const cx = x + 45;
    const cy = y + 36;
    ctx.moveTo(cx - 18, cy + 10);
    ctx.lineTo(cx - 22, cy - 8);
    ctx.lineTo(cx - 10, cy);
    ctx.lineTo(cx, cy - 14);
    ctx.lineTo(cx + 10, cy);
    ctx.lineTo(cx + 22, cy - 8);
    ctx.lineTo(cx + 18, cy + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 16, y - 55, 12, 55);

    // Foliage
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + 22, y - 65, 26, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 55, 20, 0, Math.PI * 2);
    ctx.arc(x + 36, y - 55, 20, 0, Math.PI * 2);
    ctx.fill();

    // Dark foliage shadow
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(x + 22, y - 52, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawStreetLamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 8, y - 110, 5, 110);
    ctx.beginPath();
    ctx.arc(x + 18, y - 110, 10, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Lamp head
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + 24, y - 105, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawGround(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Curb / Sidewalk layer
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, this.GROUND_Y - 6, this.V_WIDTH, 6);

    // Main asphalt road
    const roadGrad = ctx.createLinearGradient(0, this.GROUND_Y, 0, this.V_HEIGHT);
    roadGrad.addColorStop(0, '#334155');
    roadGrad.addColorStop(0.3, '#1e293b');
    roadGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, this.GROUND_Y, this.V_WIDTH, this.V_HEIGHT - this.GROUND_Y);

    // Yellow dashed lane lines
    ctx.fillStyle = '#facc15';
    const dashLength = 32;
    const dashGap = 28;
    const dashStep = dashLength + dashGap;
    const dashY = this.GROUND_Y + 55;

    for (let x = -60; x < this.V_WIDTH + 60; x += dashStep) {
      const dx = x - (this.bgGroundOffset % dashStep);
      ctx.fillRect(dx, dashY, dashLength, 6);
    }

    // Steel subway railway rails embedded in street
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, this.GROUND_Y + 22, this.V_WIDTH, 4);
    ctx.fillRect(0, this.GROUND_Y + 95, this.V_WIDTH, 4);

    // Rail cross ties
    ctx.fillStyle = '#475569';
    for (let x = -30; x < this.V_WIDTH + 30; x += 36) {
      const rx = x - (this.bgGroundOffset % 36);
      ctx.fillRect(rx, this.GROUND_Y + 16, 8, 16);
      ctx.fillRect(rx, this.GROUND_Y + 89, 8, 16);
    }

    ctx.restore();
  }

  private drawObstacles(ctx: CanvasRenderingContext2D) {
    for (const obs of this.obstacles) {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      switch (obs.type) {
        case 'CRATE': {
          this.drawWoodenCrate(ctx, obs.width, obs.height);
          break;
        }

        case 'DOUBLE_CRATE': {
          this.drawWoodenCrate(ctx, obs.width, obs.height / 2);
          ctx.translate(0, obs.height / 2);
          this.drawWoodenCrate(ctx, obs.width, obs.height / 2);
          break;
        }

        case 'ROAD_BARRIER': {
          this.drawRoadBarrier(ctx, obs.width, obs.height);
          break;
        }

        case 'LOW_OVERHEAD_SIGN': {
          this.drawOverheadSign(ctx, obs.width, obs.height);
          break;
        }

        case 'TRAIN_CAR': {
          this.drawTrainObstacle(ctx, obs.width, obs.height);
          break;
        }

        case 'HAZARD_CONES': {
          this.drawTrafficCone(ctx, obs.width, obs.height);
          break;
        }
      }

      ctx.restore();
    }
  }

  private drawWoodenCrate(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#b45309'; // wood amber
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;

    ctx.fillRect(0, 0, w, h);
    ctx.strokeRect(0, 0, w, h);

    // Inner bevel & cross
    ctx.fillStyle = '#d97706';
    ctx.fillRect(5, 5, w - 10, h - 10);
    ctx.strokeRect(5, 5, w - 10, h - 10);

    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(w - 5, h - 5);
    ctx.moveTo(w - 5, 5);
    ctx.lineTo(5, h - 5);
    ctx.stroke();
  }

  private drawRoadBarrier(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Left & Right metal legs
    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 12, 8, h - 12);
    ctx.fillRect(w - 14, 12, 8, h - 12);

    // Feet
    ctx.fillRect(0, h - 6, 20, 6);
    ctx.fillRect(w - 20, h - 6, 20, 6);

    // Striped crossbars (orange & white)
    this.drawStripedBar(ctx, 0, 12, w, 18);
    this.drawStripedBar(ctx, 0, 36, w, 18);

    // Blinking amber beacon on top
    const blink = Math.sin(this.animTime * 12) > 0;
    ctx.fillStyle = blink ? '#fef08a' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(w / 2, 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private drawStripedBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.fillStyle = '#ea580c'; // orange
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#ffffff'; // white diagonal stripes
    for (let sx = x - 20; sx < x + w + 20; sx += 18) {
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.lineTo(sx + 10, y);
      ctx.lineTo(sx - 2, y + h);
      ctx.lineTo(sx - 12, y + h);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  private drawOverheadSign(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Vertical steel truss support posts
    ctx.fillStyle = '#475569';
    ctx.fillRect(4, 0, 10, h);
    ctx.fillRect(w - 14, 0, 10, h);

    // Cross brace on truss
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 20);
    ctx.lineTo(w - 4, 60);
    ctx.stroke();

    // Sign Board at the top
    ctx.fillStyle = '#facc15'; // bright yellow caution sign
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, 52, 6);
    ctx.fill();
    ctx.stroke();

    // Hazard border stripes
    this.drawStripedBar(ctx, 4, 4, w - 8, 10);

    // "SLIDE!" text & Down arrow
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px "Titan One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▼ SLIDE ▼', w / 2, 36);
  }

  private drawTrainObstacle(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Subway Train Carriage (Stationary or track blocker with solid walkable roof!)
    // Blue & White Subway Body
    ctx.fillStyle = '#1e40af';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, [8, 8, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Solid walking rooftop non-slip grill
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, 0, w - 8, 10);
    ctx.strokeRect(4, 0, w - 8, 10);

    // White body center stripe
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 24, w, 22);

    // Windows with glass reflection
    ctx.fillStyle = '#38bdf8';
    for (let wx = 18; wx < w - 24; wx += 44) {
      ctx.fillRect(wx, 16, 28, 32);
      ctx.strokeRect(wx, 16, 28, 32);
      // Window reflection slash
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(wx + 4, 18, 6, 28);
      ctx.fillStyle = '#38bdf8';
    }

    // Heavy train steel wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(36, h, 14, 0, Math.PI * 2);
    ctx.arc(w - 36, h, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Train front hazard warning
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 52, 12, 28);
  }

  private drawTrafficCone(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Base
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.fillRect(4, h - 8, w - 8, 8);
    ctx.strokeRect(4, h - 8, w - 8, 8);

    // Cone body
    ctx.beginPath();
    ctx.moveTo(w / 2 - 4, 4);
    ctx.lineTo(w / 2 + 4, 4);
    ctx.lineTo(w - 8, h - 8);
    ctx.lineTo(8, h - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White reflective sleeve
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 6, 18);
    ctx.lineTo(w / 2 + 6, 18);
    ctx.lineTo(w / 2 + 10, 28);
    ctx.lineTo(w / 2 - 10, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawCoins(ctx: CanvasRenderingContext2D) {
    for (const coin of this.coins) {
      ctx.save();
      ctx.translate(coin.x, coin.y);

      // 3D rotation scale
      const cosR = Math.cos(coin.rotation);
      ctx.scale(Math.abs(cosR) * 0.8 + 0.2, 1);

      // Gold Coin Outer Rim
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shiny Face
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius * 0.78, 0, Math.PI * 2);
      ctx.fill();

      // Star emblem in center (just like the game poster!)
      ctx.fillStyle = '#d97706';
      this.drawStarPath(ctx, 0, 0, 5, coin.radius * 0.45, coin.radius * 0.22);
      ctx.fill();

      ctx.restore();
    }
  }

  private drawStarPath(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outer: number,
    inner: number
  ) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outer);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
      rot += step;
    }
    ctx.closePath();
  }

  private drawPowerUpItems(ctx: CanvasRenderingContext2D) {
    for (const item of this.powerUpItems) {
      ctx.save();
      const bob = Math.sin(item.pulse * 2) * 6;
      ctx.translate(item.x + item.width / 2, item.y + item.height / 2 + bob);

      // Pulsing outer glow aura
      const pulseScale = 1 + Math.sin(item.pulse * 3) * 0.12;
      ctx.scale(pulseScale, pulseScale);

      // Bubble frame
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      switch (item.type) {
        case 'MAGNET': {
          // Horseshoe magnet icon
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 2, 13, Math.PI, 0, false);
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#ef4444';
          ctx.stroke();

          // Silver tips
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-16, 2, 6, 7);
          ctx.fillRect(10, 2, 6, 7);
          break;
        }

        case 'SHIELD': {
          // Blue diamond energy shield
          ctx.fillStyle = '#06b6d4';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(13, -4);
          ctx.lineTo(0, 14);
          ctx.lineTo(-13, -4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'MULTIPLIER': {
          // Golden star 2X badge
          ctx.fillStyle = '#f59e0b';
          this.drawStarPath(ctx, 0, 0, 5, 14, 7);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "Titan One", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('2X', 0, 1);
          break;
        }

        case 'SUPER_JUMP': {
          // Red winged high-top sneaker
          ctx.fillStyle = '#ef4444';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(-10, -4, 20, 10, 3);
          ctx.fill();
          ctx.stroke();

          // Wing feathers
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-10, -4);
          ctx.lineTo(-18, -12);
          ctx.lineTo(-6, -8);
          ctx.closePath();
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    }
  }

  // --- Getters ---

  public getStats(): RunStats {
    return { ...this.runStats };
  }

  public getScore(): number {
    return this.score;
  }

  public getDistance(): number {
    return this.gameDistance;
  }

  public getCoins(): number {
    return this.coinsCollected;
  }
}
