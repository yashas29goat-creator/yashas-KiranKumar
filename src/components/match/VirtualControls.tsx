import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Zap, Shield, Target, Flame } from 'lucide-react';
import { sound } from '../../utils/soundFx';

interface VirtualControlsProps {
  onJoystickMove: (data: { active: boolean; dx: number; dy: number }) => void;
  onShoot: (power: number) => void;
  onPass: (isThrough: boolean) => void;
  onSkillMove: (skill: 'roulette' | 'rainbow' | 'stepover') => void;
  onSlideTackle: () => void;
  onSwitchPlayer: () => void;
  onSprintToggle: (sprinting: boolean) => void;
  hasBall: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onJoystickMove,
  onShoot,
  onPass,
  onSkillMove,
  onSlideTackle,
  onSwitchPlayer,
  onSprintToggle,
  hasBall,
}) => {
  // Joystick State
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isJoystickDragging, setIsJoystickDragging] = useState(false);
  const [activeSkill, setActiveSkill] = useState<'roulette' | 'rainbow' | 'stepover'>('roulette');

  // Shoot Power Charging State
  const [shootPower, setShootPower] = useState(0);
  const shootChargeInterval = useRef<number | null>(null);
  const shootStartTime = useRef<number>(0);

  // Keyboard controls listener
  useEffect(() => {
    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing input if focused in text inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      keysPressed.add(e.key.toLowerCase());

      let dx = 0;
      let dy = 0;
      if (keysPressed.has('w') || keysPressed.has('arrowup')) dy -= 1;
      if (keysPressed.has('s') || keysPressed.has('arrowdown')) dy += 1;
      if (keysPressed.has('a') || keysPressed.has('arrowleft')) dx -= 1;
      if (keysPressed.has('d') || keysPressed.has('arrowright')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        onJoystickMove({ active: true, dx, dy });
      }

      // Action Keys
      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        if (!shootChargeInterval.current) {
          shootStartTime.current = Date.now();
          shootChargeInterval.current = window.setInterval(() => {
            const elapsed = (Date.now() - shootStartTime.current) / 800; // max out at 0.8s
            setShootPower(Math.min(1.0, elapsed));
          }, 30);
        }
      } else if (e.key === 'j' || e.key === 'J') {
        if (hasBall) onPass(false);
        else onSwitchPlayer();
      } else if (e.key === 'l' || e.key === 'L') {
        if (hasBall) onPass(true);
        else onSlideTackle();
      } else if (e.key === 'i' || e.key === 'I' || e.key === 'Shift') {
        onSprintToggle(true);
        onSkillMove(activeSkill);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key.toLowerCase());

      let dx = 0;
      let dy = 0;
      if (keysPressed.has('w') || keysPressed.has('arrowup')) dy -= 1;
      if (keysPressed.has('s') || keysPressed.has('arrowdown')) dy += 1;
      if (keysPressed.has('a') || keysPressed.has('arrowleft')) dx -= 1;
      if (keysPressed.has('d') || keysPressed.has('arrowright')) dx += 1;

      if (dx === 0 && dy === 0) {
        onJoystickMove({ active: false, dx: 0, dy: 0 });
      } else {
        onJoystickMove({ active: true, dx, dy });
      }

      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        if (shootChargeInterval.current) {
          clearInterval(shootChargeInterval.current);
          shootChargeInterval.current = null;
          const power = Math.max(0.35, (Date.now() - shootStartTime.current) / 800);
          setShootPower(0);
          if (hasBall) onShoot(Math.min(1.0, power));
          else onSlideTackle();
        }
      } else if (e.key === 'i' || e.key === 'I' || e.key === 'Shift') {
        onSprintToggle(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (shootChargeInterval.current) clearInterval(shootChargeInterval.current);
    };
  }, [hasBall, activeSkill, onJoystickMove, onPass, onShoot, onSkillMove, onSlideTackle, onSprintToggle, onSwitchPlayer]);

  // Touch / Pointer Joystick Handling
  const handlePointerDownJoystick = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsJoystickDragging(true);
    updateJoystickFromPointer(e);
  };

  const handlePointerMoveJoystick = (e: React.PointerEvent) => {
    if (!isJoystickDragging) return;
    updateJoystickFromPointer(e);
  };

  const handlePointerUpJoystick = (e: React.PointerEvent) => {
    setIsJoystickDragging(false);
    setJoystickPos({ x: 0, y: 0 });
    onJoystickMove({ active: false, dx: 0, dy: 0 });
  };

  const updateJoystickFromPointer = (e: React.PointerEvent) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = e.clientX - centerX;
    const rawDy = e.clientY - centerY;
    const maxRadius = rect.width / 2;
    const distance = Math.hypot(rawDx, rawDy);

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(rawDy, rawDx);
    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: clampedX, y: clampedY });
    onJoystickMove({
      active: true,
      dx: clampedX / maxRadius,
      dy: clampedY / maxRadius,
    });
  };

  // Shoot button touch press/hold
  const handleShootStart = () => {
    shootStartTime.current = Date.now();
    shootChargeInterval.current = window.setInterval(() => {
      const elapsed = (Date.now() - shootStartTime.current) / 800;
      setShootPower(Math.min(1.0, elapsed));
    }, 30);
  };

  const handleShootEnd = () => {
    if (shootChargeInterval.current) {
      clearInterval(shootChargeInterval.current);
      shootChargeInterval.current = null;
      const power = Math.max(0.35, (Date.now() - shootStartTime.current) / 800);
      setShootPower(0);
      if (hasBall) onShoot(Math.min(1.0, power));
      else onSlideTackle();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-end justify-between p-4 select-none">
      {/* ================= LEFT: VIRTUAL ANALOG JOYSTICK ================= */}
      <div className="pointer-events-auto relative flex flex-col items-center">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDownJoystick}
          onPointerMove={handlePointerMoveJoystick}
          onPointerUp={handlePointerUpJoystick}
          onPointerCancel={handlePointerUpJoystick}
          className="w-36 h-36 rounded-full bg-slate-950/70 border-2 border-amber-500/40 backdrop-blur-md flex items-center justify-center shadow-2xl touch-none relative"
        >
          {/* Concentric Guide Ring */}
          <div className="w-24 h-24 rounded-full border border-amber-500/20 pointer-events-none" />

          {/* Cardinal Directions */}
          <span className="absolute top-1.5 text-[9px] font-bold text-amber-400/60 uppercase">▲ W</span>
          <span className="absolute bottom-1.5 text-[9px] font-bold text-amber-400/60 uppercase">▼ S</span>
          <span className="absolute left-2 text-[9px] font-bold text-amber-400/60 uppercase">◀ A</span>
          <span className="absolute right-2 text-[9px] font-bold text-amber-400/60 uppercase">D ▶</span>

          {/* Glowing Thumbpad Stick */}
          <div
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
              transition: isJoystickDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.6)] border-2 border-amber-200 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="w-5 h-5 rounded-full bg-amber-900/40 border border-amber-200/60" />
          </div>
        </div>
        <span className="mt-1.5 text-[10px] tracking-wider uppercase font-semibold text-slate-300/80 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700">
          Movement / WASD
        </span>
      </div>

      {/* ================= RIGHT: 4-ACTION DIAMOND CLUSTER ================= */}
      <div className="pointer-events-auto relative w-56 h-56">
        {/* Power Charge Bar HUD (appears when shooting) */}
        {shootPower > 0 && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-48 bg-slate-950/90 border border-red-500 rounded-full p-1 shadow-lg flex flex-col items-center">
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${shootPower * 100}%` }}
                className={`h-full transition-all duration-75 ${
                  shootPower > 0.85
                    ? 'bg-gradient-to-r from-amber-400 to-red-600 shadow-[0_0_12px_#ef4444]'
                    : 'bg-gradient-to-r from-emerald-400 to-amber-400'
                }`}
              />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 mt-0.5">
              Power Strike: {Math.round(shootPower * 100)}%
            </span>
          </div>
        )}

        {/* TOP BUTTON: SPRINT / 5★ SKILL */}
        <button
          onPointerDown={() => {
            onSprintToggle(true);
            onSkillMove(activeSkill);
          }}
          onPointerUp={() => onSprintToggle(false)}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex flex-col items-center justify-center border-2 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-transform"
        >
          <Zap className="w-5 h-5 mb-0.5 text-emerald-100" />
          <span className="text-[10px] leading-tight">SPRINT</span>
          <span className="text-[8px] text-emerald-200">5★ Skill [I]</span>
        </button>

        {/* LEFT BUTTON: PASS / SWITCH */}
        <button
          onClick={() => {
            if (hasBall) onPass(false);
            else onSwitchPlayer();
          }}
          className="absolute top-1/2 left-0 -translate-y-1/2 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs flex flex-col items-center justify-center border-2 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform"
        >
          <Target className="w-5 h-5 mb-0.5 text-blue-100" />
          <span className="text-[10px] leading-tight">{hasBall ? 'PASS' : 'SWITCH'}</span>
          <span className="text-[8px] text-blue-200">[J]</span>
        </button>

        {/* RIGHT BUTTON: SHOOT / SLIDE */}
        <button
          onPointerDown={handleShootStart}
          onPointerUp={handleShootEnd}
          onPointerCancel={handleShootEnd}
          className="absolute top-1/2 right-0 -translate-y-1/2 w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs flex flex-col items-center justify-center border-2 border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform"
        >
          <Flame className="w-5 h-5 mb-0.5 text-red-100" />
          <span className="text-[10px] leading-tight">{hasBall ? 'SHOOT' : 'SLIDE'}</span>
          <span className="text-[8px] text-red-200">[Space/K]</span>
        </button>

        {/* BOTTOM BUTTON: THROUGH / PRESS */}
        <button
          onClick={() => {
            if (hasBall) onPass(true);
            else onSlideTackle();
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs flex flex-col items-center justify-center border-2 border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-transform"
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-purple-100" />
          <span className="text-[10px] leading-tight">{hasBall ? 'THROUGH' : 'PRESS'}</span>
          <span className="text-[8px] text-purple-200">[L]</span>
        </button>

        {/* Skill Selector Switcher (Center Mini Badge) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={() => {
              const skills: ('roulette' | 'rainbow' | 'stepover')[] = ['roulette', 'rainbow', 'stepover'];
              const nextIdx = (skills.indexOf(activeSkill) + 1) % skills.length;
              setActiveSkill(skills[nextIdx]);
              sound.playClick(800);
            }}
            className="px-2 py-1 rounded-full bg-slate-900/90 border border-amber-400/60 text-[9px] font-bold text-amber-300 flex items-center gap-1 hover:border-amber-300 shadow-md"
            title="Click to cycle active 5-star skill"
          >
            <span>5★</span>
            <span className="uppercase">{activeSkill}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
