/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine, RunStats } from './game/engine';
import {
  CharacterSkin,
  GameSettings,
  GameState,
  HighScoreRecord,
  Mission,
  PowerUpActive,
} from './game/types';
import {
  getActiveSkin,
  getHighScore,
  getHighScoresList,
  getMissions,
  getSettings,
  getSkins,
  getTotalCoins,
  recordRun,
  saveHighScore,
  saveSettings,
  setActiveSkin,
  unlockSkin,
  updateMissionsProgress,
  addCoins,
} from './game/storage';
import { soundEngine } from './game/audio';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { ShopModal } from './components/ShopModal';
import { MissionsModal } from './components/MissionsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { usePWA } from './hooks/usePWA';
import { PWAInstallWidget } from './components/PWAInstallWidget';
import { PWAManualGuideModal } from './components/PWAManualGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>('MENU');

  // Stored State
  const [highScore, setHighScore] = useState<number>(() => getHighScore());
  const [totalCoins, setTotalCoins] = useState<number>(() => getTotalCoins());
  const [activeSkin, setCurrentSkin] = useState<CharacterSkin>(() => getActiveSkin());
  const [skins, setSkins] = useState<CharacterSkin[]>(() => getSkins());
  const [missions, setMissions] = useState<Mission[]>(() => getMissions());
  const [settings, setGameSettings] = useState<GameSettings>(() => getSettings());
  const [highScoreRecords, setHighScoreRecords] = useState<HighScoreRecord[]>(() => getHighScoresList());

  // Active Run Metrics (for HUD)
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [currentCoins, setCurrentCoins] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [activePowerUps, setActivePowerUps] = useState<PowerUpActive[]>([]);

  // Post-Game Summary State
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [completedMission, setCompletedMission] = useState<Mission | null>(null);
  const [missionRewardEarned, setMissionRewardEarned] = useState<number>(0);

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showMissions, setShowMissions] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Progressive Web App (PWA) System
  const {
    isInstalled,
    isIOS,
    isOnline,
    showPromptWidget,
    showManualGuide,
    setShowManualGuide,
    install,
    dismiss,
    openInstallPrompt,
    deviceType,
  } = usePWA();

  // Engine instance ref
  const engineRef = useRef<GameEngine | null>(null);

  // Audio settings sync
  useEffect(() => {
    soundEngine.setVolumes(
      settings.musicVolume,
      settings.sfxVolume,
      settings.soundMuted
    );
  }, [settings]);

  // Handle Game Over callback
  const handleGameOver = useCallback((score: number, distance: number, coins: number, stats: RunStats) => {
    // 1. Check high score
    const wasNewRecord = saveHighScore(score);
    setIsNewRecord(wasNewRecord);
    if (wasNewRecord) {
      setHighScore(score);
    }

    // 2. Add collected coins to career total
    const updatedCoins = addCoins(coins);
    setTotalCoins(updatedCoins);

    // 3. Record run to leaderboard list
    recordRun(score, distance, coins);
    setHighScoreRecords(getHighScoresList());

    // 4. Update Missions progress
    const { completedMission: missionDone, rewardsAwarded } = updateMissionsProgress(stats);
    setCompletedMission(missionDone);
    setMissionRewardEarned(rewardsAwarded);
    if (rewardsAwarded > 0) {
      setTotalCoins(prev => prev + rewardsAwarded);
    }
    setMissions(getMissions());

    // 5. Change state to GAMEOVER
    setGameState('GAMEOVER');
  }, []);

  // Initialize Engine
  useEffect(() => {
    const engine = new GameEngine(activeSkin, {
      onScoreUpdate: (score, distance, coins, mult) => {
        setCurrentScore(score);
        setCurrentDistance(distance);
        setCurrentCoins(coins);
        setMultiplier(mult);
      },
      onGameOver: handleGameOver,
      onPowerUpChange: (powerUps) => {
        setActivePowerUps([...powerUps]);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, [activeSkin, handleGameOver]);

  // Update skin on engine when activeSkin changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSkin(activeSkin);
    }
  }, [activeSkin]);

  // --- Actions ---

  const handleStartGame = () => {
    soundEngine.playClick();
    setCurrentScore(0);
    setCurrentDistance(0);
    setCurrentCoins(0);
    setMultiplier(1);
    setActivePowerUps([]);
    setIsNewRecord(false);
    setCompletedMission(null);
    setMissionRewardEarned(0);

    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  const handlePause = () => {
    if (gameState !== 'PLAYING') return;
    soundEngine.playClick();
    setGameState('PAUSED');
    if (engineRef.current) {
      engineRef.current.pause();
    }
  };

  const handleResume = () => {
    soundEngine.playClick();
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.resume();
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    handleStartGame();
  };

  const handleMainMenu = () => {
    soundEngine.playClick();
    setGameState('MENU');
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.reset();
    }
  };

  const handleToggleMute = () => {
    const updated = { ...settings, soundMuted: !settings.soundMuted };
    setGameSettings(updated);
    saveSettings(updated);
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setGameSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSelectSkin = (skinId: string) => {
    soundEngine.playClick();
    setActiveSkin(skinId);
    const updatedSkin = skins.find(s => s.id === skinId);
    if (updatedSkin) {
      setCurrentSkin(updatedSkin);
    }
  };

  const handleUnlockSkin = (skinId: string) => {
    soundEngine.playClick();
    const success = unlockSkin(skinId);
    if (success) {
      soundEngine.playPowerUp();
      const updatedSkins = getSkins();
      setSkins(updatedSkins);
      setTotalCoins(getTotalCoins());
      handleSelectSkin(skinId);
    }
  };

  // Keyboard shortcut for menu & game over space/enter
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (gameState === 'MENU' && !showHowToPlay && !showSettings && !showShop && !showMissions && !showLeaderboard) {
          e.preventDefault();
          handleStartGame();
        } else if (gameState === 'GAMEOVER') {
          e.preventDefault();
          handleStartGame();
        }
      } else if (e.code === 'KeyR' && gameState === 'GAMEOVER') {
        e.preventDefault();
        handleStartGame();
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [gameState, showHowToPlay, showSettings, showShop, showMissions, showLeaderboard]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col select-none">
      {/* Game Canvas Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <GameCanvas
          engine={engineRef.current}
          onPauseToggle={() => {
            if (gameState === 'PLAYING') handlePause();
            else if (gameState === 'PAUSED') handleResume();
          }}
        />

        {/* HUD Overlay during active gameplay */}
        {gameState === 'PLAYING' && (
          <GameHUD
            score={currentScore}
            distance={currentDistance}
            coins={currentCoins}
            multiplier={multiplier}
            activePowerUps={activePowerUps}
            onPause={handlePause}
            onJump={() => engineRef.current?.handleJump()}
            onSlide={() => engineRef.current?.handleSlide()}
            showTouchControls={settings.touchControls !== 'gestures'}
          />
        )}

        {/* Main Menu UI */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-20">
            <MainMenu
              highScore={highScore}
              totalCoins={totalCoins}
              activeSkin={activeSkin}
              missions={missions}
              isMuted={settings.soundMuted}
              isInstalled={isInstalled}
              onPlay={handleStartGame}
              onOpenHowToPlay={() => setShowHowToPlay(true)}
              onOpenMissions={() => setShowMissions(true)}
              onOpenShop={() => setShowShop(true)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenInstall={openInstallPrompt}
              onToggleMute={handleToggleMute}
            />

            {/* Smart PWA Installation Floating Card (only in Main Menu, never during gameplay) */}
            {showPromptWidget && !isInstalled && (
              <PWAInstallWidget
                onInstall={install}
                onDismiss={() => dismiss(24)}
                isIOS={isIOS}
              />
            )}
          </div>
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            score={currentScore}
            distance={currentDistance}
            coins={currentCoins}
            isMuted={settings.soundMuted}
            onResume={handleResume}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'GAMEOVER' && (
          <GameOverModal
            score={currentScore}
            distance={currentDistance}
            coins={currentCoins}
            highScore={highScore}
            isNewRecord={isNewRecord}
            completedMission={completedMission}
            rewardEarned={missionRewardEarned}
            onPlayAgain={handleStartGame}
            onMainMenu={handleMainMenu}
          />
        )}

        {/* Informational & Management Modals */}
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}

        {showSettings && (
          <SettingsModal
            settings={settings}
            isInstalled={isInstalled}
            onOpenInstall={openInstallPrompt}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showShop && (
          <ShopModal
            skins={skins}
            activeSkin={activeSkin}
            totalCoins={totalCoins}
            onSelectSkin={handleSelectSkin}
            onUnlockSkin={handleUnlockSkin}
            onClose={() => setShowShop(false)}
          />
        )}

        {showMissions && (
          <MissionsModal
            missions={missions}
            onClose={() => setShowMissions(false)}
          />
        )}

        {showLeaderboard && (
          <LeaderboardModal
            records={highScoreRecords}
            onClose={() => setShowLeaderboard(false)}
          />
        )}

        {/* PWA Step-by-Step Manual Guide Modal (for iOS Safari & Unsupported Browsers) */}
        {showManualGuide && (
          <PWAManualGuideModal
            deviceType={deviceType}
            isIOS={isIOS}
            onClose={() => setShowManualGuide(false)}
          />
        )}

        {/* Offline Connectivity Toast Indicator */}
        <OfflineIndicator isOnline={isOnline} />
      </div>
    </div>
  );
}
