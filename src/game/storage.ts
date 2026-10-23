import { GameSettings, HighScoreRecord, CharacterSkin, Mission } from './types';

const STORAGE_KEYS = {
  HIGH_SCORE: 'jumping_game_highscore',
  HIGH_SCORES_LIST: 'jumping_game_history',
  TOTAL_COINS: 'jumping_game_total_coins',
  SETTINGS: 'jumping_game_settings',
  ACTIVE_SKIN: 'jumping_game_active_skin',
  UNLOCKED_SKINS: 'jumping_game_unlocked_skins',
  MISSIONS: 'jumping_game_missions',
};

export const DEFAULT_SKINS: CharacterSkin[] = [
  {
    id: 'leo_classic',
    name: 'Leo the Runner',
    price: 0,
    description: 'The iconic energetic subway runner with red cap and red hoodie.',
    colors: {
      cap: '#ef4444',
      capFront: '#ffffff',
      hoodie: '#dc2626',
      innerShirt: '#ffffff',
      pants: '#2563eb',
      shoes: '#dc2626',
      shoeSoles: '#ffffff',
      hair: '#78350f',
      backpack: '#18181b',
    },
    unlocked: true,
  },
  {
    id: 'cyber_volt',
    name: 'Cyber Runner',
    price: 150,
    description: 'Electrified street racer with neon cyan jacket and purple accents.',
    colors: {
      cap: '#06b6d4',
      capFront: '#0f172a',
      hoodie: '#0284c7',
      innerShirt: '#a855f7',
      pants: '#0f172a',
      shoes: '#06b6d4',
      shoeSoles: '#38bdf8',
      hair: '#1e1b4b',
      backpack: '#6366f1',
      glow: '#38bdf8',
    },
    unlocked: false,
  },
  {
    id: 'golden_champ',
    name: 'Golden Champion',
    price: 300,
    description: 'Pure luxury gold tracksuit for true record-breaking speedsters.',
    colors: {
      cap: '#eab308',
      capFront: '#fef08a',
      hoodie: '#ca8a04',
      innerShirt: '#18181b',
      pants: '#a16207',
      shoes: '#eab308',
      shoeSoles: '#ffffff',
      hair: '#451a03',
      backpack: '#713f12',
      glow: '#fbbf24',
    },
    unlocked: false,
  },
  {
    id: 'midnight_ninja',
    name: 'Midnight Ninja',
    price: 500,
    description: 'Stealthy parkour master of the night shadows with crimson trim.',
    colors: {
      cap: '#18181b',
      capFront: '#b91c1c',
      hoodie: '#27272a',
      innerShirt: '#dc2626',
      pants: '#18181b',
      shoes: '#991b1b',
      shoeSoles: '#27272a',
      hair: '#09090b',
      backpack: '#09090b',
    },
    unlocked: false,
  },
];

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm1_distance',
    title: 'First Dash',
    description: 'Run 250 meters in a single run',
    target: 250,
    current: 0,
    reward: 50,
    completed: false,
    type: 'DISTANCE',
  },
  {
    id: 'm2_coins',
    title: 'Coin Collector',
    description: 'Collect 25 gold coins in a single run',
    target: 25,
    current: 0,
    reward: 75,
    completed: false,
    type: 'COINS_RUN',
  },
  {
    id: 'm3_double_jump',
    title: 'Acrobat Flight',
    description: 'Perform 4 double jumps in a run',
    target: 4,
    current: 0,
    reward: 80,
    completed: false,
    type: 'DOUBLE_JUMP',
  },
  {
    id: 'm4_slide',
    title: 'Limbo Master',
    description: 'Slide under 3 low overhead obstacles',
    target: 3,
    current: 0,
    reward: 100,
    completed: false,
    type: 'SLIDE_OBSTACLE',
  },
  {
    id: 'm5_powerup',
    title: 'Power Surge',
    description: 'Collect 2 power-ups in a single run',
    target: 2,
    current: 0,
    reward: 120,
    completed: false,
    type: 'POWERUPS',
  },
  {
    id: 'm6_score',
    title: 'Subway Legend',
    description: 'Reach a total score of 1,200 points',
    target: 1200,
    current: 0,
    reward: 200,
    completed: false,
    type: 'SCORE',
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.75,
  soundMuted: false,
  touchControls: 'both',
};

export function getHighScore(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): boolean {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true; // New record!
    }
  } catch {
    // LocalStorage fallback
  }
  return false;
}

export function getHighScoresList(): HighScoreRecord[] {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES_LIST);
    if (val) {
      return JSON.parse(val);
    }
  } catch {
    // fallback
  }
  return [
    { score: 1450, distance: 480, coins: 65, date: 'Top Runner' },
    { score: 980, distance: 350, coins: 42, date: 'Challenger' },
    { score: 620, distance: 220, coins: 28, date: 'Rookie' },
  ];
}

export function recordRun(score: number, distance: number, coins: number) {
  try {
    const list = getHighScoresList();
    const newRecord: HighScoreRecord = {
      score,
      distance,
      coins,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    };
    list.push(newRecord);
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES_LIST, JSON.stringify(trimmed));
  } catch {
    // fallback
  }
}

export function getTotalCoins(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.TOTAL_COINS);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function addCoins(amount: number): number {
  try {
    const current = getTotalCoins();
    const next = current + amount;
    localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, next.toString());
    return next;
  } catch {
    return 0;
  }
}

export function spendCoins(amount: number): boolean {
  try {
    const current = getTotalCoins();
    if (current >= amount) {
      localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, (current - amount).toString());
      return true;
    }
  } catch {
    // fallback
  }
  return false;
}

export function getSettings(): GameSettings {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (val) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // fallback
  }
}

export function getSkins(): CharacterSkin[] {
  try {
    const unlockedRaw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SKINS);
    const unlockedIds: string[] = unlockedRaw ? JSON.parse(unlockedRaw) : ['leo_classic'];

    return DEFAULT_SKINS.map(skin => ({
      ...skin,
      unlocked: skin.price === 0 || unlockedIds.includes(skin.id),
    }));
  } catch {
    return DEFAULT_SKINS;
  }
}

export function unlockSkin(skinId: string): boolean {
  try {
    const skins = getSkins();
    const target = skins.find(s => s.id === skinId);
    if (!target) return false;

    if (spendCoins(target.price)) {
      const unlockedRaw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SKINS);
      const unlockedIds: string[] = unlockedRaw ? JSON.parse(unlockedRaw) : ['leo_classic'];
      if (!unlockedIds.includes(skinId)) {
        unlockedIds.push(skinId);
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(unlockedIds));
      }
      return true;
    }
  } catch {
    // fallback
  }
  return false;
}

export function getActiveSkin(): CharacterSkin {
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SKIN) || 'leo_classic';
    const skins = getSkins();
    return skins.find(s => s.id === activeId) || skins[0];
  } catch {
    return DEFAULT_SKINS[0];
  }
}

export function setActiveSkin(skinId: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SKIN, skinId);
  } catch {
    // fallback
  }
}

export function getMissions(): Mission[] {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    if (val) {
      const parsed: Mission[] = JSON.parse(val);
      // Merge with default to guarantee all missions exist
      return DEFAULT_MISSIONS.map(def => {
        const found = parsed.find(p => p.id === def.id);
        return found ? { ...def, ...found } : def;
      });
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_MISSIONS];
}

export function updateMissionsProgress(stats: {
  distance: number;
  coins: number;
  doubleJumps: number;
  slidesUnderObstacle: number;
  powerUpsCollected: number;
  score: number;
}): { completedMission: Mission | null; rewardsAwarded: number } {
  try {
    const missions = getMissions();
    let completedMission: Mission | null = null;
    let rewardsAwarded = 0;

    for (const m of missions) {
      if (m.completed) continue;

      let value = 0;
      if (m.type === 'DISTANCE') value = stats.distance;
      else if (m.type === 'COINS_RUN') value = stats.coins;
      else if (m.type === 'DOUBLE_JUMP') value = stats.doubleJumps;
      else if (m.type === 'SLIDE_OBSTACLE') value = stats.slidesUnderObstacle;
      else if (m.type === 'POWERUPS') value = stats.powerUpsCollected;
      else if (m.type === 'SCORE') value = stats.score;

      if (value > m.current) {
        m.current = Math.min(m.target, value);
      }

      if (m.current >= m.target && !m.completed) {
        m.completed = true;
        completedMission = m;
        rewardsAwarded += m.reward;
        addCoins(m.reward);
      }
    }

    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
    return { completedMission, rewardsAwarded };
  } catch {
    return { completedMission: null, rewardsAwarded: 0 };
  }
}
