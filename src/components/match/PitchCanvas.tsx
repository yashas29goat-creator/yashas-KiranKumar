import React, { useEffect, useRef } from 'react';
import { CameraMode, MatchPlayer, PitchEmote } from '../../types/football';
import { EngineState, GOAL_BOTTOM_Y, GOAL_TOP_Y, PITCH_HEIGHT, PITCH_WIDTH } from '../../utils/matchEngine';

interface PitchCanvasProps {
  engineState: EngineState;
  cameraMode: CameraMode;
  emotes: PitchEmote[];
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  engineState,
  cameraMode,
  emotes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rainDropsRef = useRef<{ x: number; y: number; speed: number; len: number }[]>([]);

  // Initialize rain drops
  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 180; i++) {
      drops.push({
        x: Math.random() * PITCH_WIDTH,
        y: Math.random() * PITCH_HEIGHT,
        speed: Math.random() * 8 + 14,
        len: Math.random() * 12 + 10,
      });
    }
    rainDropsRef.current = drops;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const { ball, players, controlledPlayerId, weather, netBulge } = engineState;

      // Handle Canvas Sizing
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const viewW = rect.width;
      const viewH = rect.height;

      // Camera transformation
      let scale = Math.min(viewW / PITCH_WIDTH, viewH / PITCH_HEIGHT) * 0.96;
      let offsetX = (viewW - PITCH_WIDTH * scale) / 2;
      let offsetY = (viewH - PITCH_HEIGHT * scale) / 2;

      if (cameraMode === 'action') {
        const controlled = players.find(p => p.id === controlledPlayerId);
        const camFocusX = controlled ? (controlled.x * 0.6 + ball.x * 0.4) : ball.x;
        const camFocusY = controlled ? (controlled.y * 0.6 + ball.y * 0.4) : ball.y;

        scale = Math.min(viewW / 580, viewH / 380);
        offsetX = viewW / 2 - camFocusX * scale;
        offsetY = viewH / 2 - camFocusY * scale;
      } else if (cameraMode === 'broadcast') {
        // Elevated dynamic tilt
        const ballFollowX = (ball.x - PITCH_WIDTH / 2) * 0.12;
        scale = Math.min(viewW / PITCH_WIDTH, viewH / PITCH_HEIGHT) * 0.94;
        offsetX = (viewW - PITCH_WIDTH * scale) / 2 - ballFollowX;
        offsetY = (viewH - PITCH_HEIGHT * scale) / 2 + 10;
      }

      // Clear full canvas background (stadium darkness or ambient)
      const isNight = weather === 'night_floodlights';
      const isRain = weather === 'rain_slick';

      ctx.fillStyle = isNight ? '#0b1120' : isRain ? '#1e293b' : '#0f172a';
      ctx.fillRect(0, 0, viewW, viewH);

      // Apply World Camera Matrix
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Render Pitch Turf (Stripes & Grass)
      const grassDark = isNight ? '#0f5132' : isRain ? '#166534' : '#15803d';
      const grassLight = isNight ? '#146c43' : isRain ? '#15803d' : '#16a34a';

      const stripeWidth = PITCH_WIDTH / 14;
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = i % 2 === 0 ? grassDark : grassLight;
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, PITCH_HEIGHT);
      }

      // Stadium Floodlight Cones (Night Mode)
      if (isNight) {
        const corners = [
          { x: 0, y: 0 },
          { x: PITCH_WIDTH, y: 0 },
          { x: 0, y: PITCH_HEIGHT },
          { x: PITCH_WIDTH, y: PITCH_HEIGHT },
        ];
        corners.forEach(c => {
          const grad = ctx.createRadialGradient(c.x, c.y, 20, c.x, c.y, 650);
          grad.addColorStop(0, 'rgba(255, 255, 230, 0.18)');
          grad.addColorStop(0.6, 'rgba(255, 255, 200, 0.05)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);
        });
      }

      // Pitch Markings (White Lines with slight glow)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3.2;

      // Outer Pitch Boundary
      ctx.strokeRect(30, 20, PITCH_WIDTH - 60, PITCH_HEIGHT - 40);

      // Halfway Line
      ctx.beginPath();
      ctx.moveTo(PITCH_WIDTH / 2, 20);
      ctx.lineTo(PITCH_WIDTH / 2, PITCH_HEIGHT - 20);
      ctx.stroke();

      // Center Circle & Center Spot
      ctx.beginPath();
      ctx.arc(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Left Penalty Box & 6-Yard Box
      ctx.strokeRect(30, 160, 160, 400);
      ctx.strokeRect(30, 240, 55, 240);
      // Left Penalty Spot & Arc
      ctx.beginPath();
      ctx.arc(145, PITCH_HEIGHT / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(145, PITCH_HEIGHT / 2, 65, -0.65, 0.65);
      ctx.stroke();

      // Right Penalty Box & 6-Yard Box
      ctx.strokeRect(PITCH_WIDTH - 190, 160, 160, 400);
      ctx.strokeRect(PITCH_WIDTH - 85, 240, 55, 240);
      // Right Penalty Spot & Arc
      ctx.beginPath();
      ctx.arc(PITCH_WIDTH - 145, PITCH_HEIGHT / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(PITCH_WIDTH - 145, PITCH_HEIGHT / 2, 65, Math.PI - 0.65, Math.PI + 0.65);
      ctx.stroke();

      // Corner Arcs
      const cornerRadius = 18;
      ctx.beginPath();
      ctx.arc(30, 20, cornerRadius, 0, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(30, PITCH_HEIGHT - 20, cornerRadius, -Math.PI / 2, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(PITCH_WIDTH - 30, 20, cornerRadius, Math.PI / 2, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(PITCH_WIDTH - 30, PITCH_HEIGHT - 20, cornerRadius, Math.PI, Math.PI * 1.5);
      ctx.stroke();

      // Goal Nets
      // Left Goal Net
      ctx.strokeStyle = 'rgba(240, 240, 240, 0.75)';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(10 - netBulge.left, GOAL_TOP_Y, 20 + netBulge.left, GOAL_BOTTOM_Y - GOAL_TOP_Y);
      // Left Net mesh lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      for (let y = GOAL_TOP_Y; y <= GOAL_BOTTOM_Y; y += 14) {
        ctx.beginPath();
        ctx.moveTo(10 - netBulge.left, y);
        ctx.lineTo(30, y);
        ctx.stroke();
      }

      // Right Goal Net
      ctx.strokeStyle = 'rgba(240, 240, 240, 0.75)';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(PITCH_WIDTH - 30, GOAL_TOP_Y, 20 + netBulge.right, GOAL_BOTTOM_Y - GOAL_TOP_Y);
      // Right Net mesh lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      for (let y = GOAL_TOP_Y; y <= GOAL_BOTTOM_Y; y += 14) {
        ctx.beginPath();
        ctx.moveTo(PITCH_WIDTH - 30, y);
        ctx.lineTo(PITCH_WIDTH - 10 + netBulge.right, y);
        ctx.stroke();
      }

      // Goal Posts (Pillars with 3D metallic gradient)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(30, GOAL_TOP_Y, 5, 0, Math.PI * 2);
      ctx.arc(30, GOAL_BOTTOM_Y, 5, 0, Math.PI * 2);
      ctx.arc(PITCH_WIDTH - 30, GOAL_TOP_Y, 5, 0, Math.PI * 2);
      ctx.arc(PITCH_WIDTH - 30, GOAL_BOTTOM_Y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Rain Particles (Rain Mode)
      if (isRain) {
        ctx.strokeStyle = 'rgba(200, 230, 255, 0.4)';
        ctx.lineWidth = 1.5;
        rainDropsRef.current.forEach(drop => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.speed * 0.2, drop.y + drop.len);
          ctx.stroke();
          drop.y += drop.speed;
          drop.x -= drop.speed * 0.2;
          if (drop.y > PITCH_HEIGHT) {
            drop.y = -10;
            drop.x = Math.random() * PITCH_WIDTH;
          }
        });
      }

      // Render Players Shadows first
      players.forEach(p => {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 7, 12, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = isNight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.35)';
        ctx.fill();
      });

      // Render Players
      players.forEach(p => {
        const isControlled = p.id === controlledPlayerId;
        const isHome = p.team === 'home';

        // Directional Indicator Cone for Controlled Player
        if (isControlled) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.facingAngle);

          const coneGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 38);
          coneGrad.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
          coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(38, -12);
          ctx.lineTo(38, 12);
          ctx.closePath();
          ctx.fill();

          // Outer pulsating ring
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 19, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

        // Slide Tackle Streak Mark
        if (p.state === 'tackling') {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(p.x - Math.cos(p.facingAngle) * 24, p.y - Math.sin(p.facingAngle) * 24);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.restore();
        }

        // Skill Move Particle Aura
        if (p.state === 'skill_move') {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Player Circle Body
        const kitColor = isHome ? (p.position === 'GK' ? '#0284c7' : '#1e3a8a') : (p.position === 'GK' ? '#eab308' : '#dc2626');
        const trimColor = isHome ? '#f59e0b' : '#38bdf8';

        ctx.fillStyle = kitColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = trimColor;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Kit Number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.number.toString(), p.x, p.y);

        // Player Name Label & OVR Badge
        ctx.font = 'bold 8.5px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(p.shortName, p.x, p.y - 17);
        ctx.shadowBlur = 0;
      });

      // Render Ball Shadow
      ctx.beginPath();
      const shadowRadius = Math.max(3, 7 - ball.z * 0.08);
      ctx.ellipse(ball.x, ball.y + 4, shadowRadius, shadowRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.15, 0.55 - ball.z * 0.008)})`;
      ctx.fill();

      // Render 3D Ball (Elevated based on z height)
      const ballVisualY = ball.y - ball.z * 0.85;
      const ballRadius = 6.2 + Math.min(4, ball.z * 0.06);

      // Ball Outer Glow / Trail if shot fast
      const ballSpeed = Math.hypot(ball.vx, ball.vy);
      if (ballSpeed > 10) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 230, 100, 0.45)';
        ctx.lineWidth = ballRadius * 1.5;
        ctx.beginPath();
        ctx.moveTo(ball.x - ball.vx * 2, ballVisualY - ball.vy * 2);
        ctx.lineTo(ball.x, ballVisualY);
        ctx.stroke();
        ctx.restore();
      }

      // Ball Core
      ctx.beginPath();
      ctx.arc(ball.x, ballVisualY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Ball Pentagons / Seams
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ball.x - 1.5, ballVisualY - 1.5, ballRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Render Floating Pitch Emotes
      emotes.forEach(emote => {
        ctx.save();
        ctx.globalAlpha = emote.opacity;
        ctx.font = '28px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(emote.emoji, emote.x, emote.y);
        ctx.restore();
      });

      ctx.restore(); // Restore camera matrix

      // ================= TACTICAL 2D RADAR MINIMAP =================
      const radarW = 160;
      const radarH = 105;
      const radarX = viewW - radarW - 16;
      const radarY = 16;

      ctx.save();
      // Radar Box Glassmorphism
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(radarX, radarY, radarW, radarH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(radarX, radarY, radarW, radarH);

      // Radar pitch markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(radarX + radarW / 2, radarY);
      ctx.lineTo(radarX + radarW / 2, radarY + radarH);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(radarX + radarW / 2, radarY + radarH / 2, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Radar Players
      players.forEach(p => {
        const rx = radarX + (p.x / PITCH_WIDTH) * radarW;
        const ry = radarY + (p.y / PITCH_HEIGHT) * radarH;

        ctx.fillStyle = p.id === controlledPlayerId ? '#f59e0b' : p.team === 'home' ? '#3b82f6' : '#ef4444';
        ctx.beginPath();
        ctx.arc(rx, ry, p.id === controlledPlayerId ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Radar Ball
      const rbx = radarX + (ball.x / PITCH_WIDTH) * radarW;
      const rby = radarY + (ball.y / PITCH_HEIGHT) * radarH;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(rbx, rby, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.restore(); // Restore dpr scale

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engineState, cameraMode, emotes]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block touch-none select-none cursor-crosshair"
    />
  );
};
