import {
  Ball,
  CommentaryItem,
  DifficultyLevel,
  GoalWalkoutEvent,
  MatchPlayer,
  MatchStatistics,
  PlayerCard,
  TacticMode,
  Team,
  WeatherMode,
} from '../types/football';
import { FORMATION_COORDINATES } from '../data/players';
import { sound } from './soundFx';

export const PITCH_WIDTH = 1100;
export const PITCH_HEIGHT = 720;
export const GOAL_WIDTH = 150; // Goal height in Y (centered around 360)
export const GOAL_TOP_Y = 285;
export const GOAL_BOTTOM_Y = 435;
export const GOAL_DEPTH = 36;

export interface EngineState {
  timeSeconds: number; // in-match simulated seconds (0 - 5400 for 90 min)
  stoppageTime: number; // 1-5 min
  isHalfTime: boolean;
  isFullTime: boolean;
  isPlaying: boolean;
  score: { home: number; away: number };
  ball: Ball;
  players: MatchPlayer[];
  controlledPlayerId: string;
  stats: { home: MatchStatistics; away: MatchStatistics };
  commentary: CommentaryItem[];
  latestGoalWalkout: GoalWalkoutEvent | null;
  tactics: { home: TacticMode; away: TacticMode };
  weather: WeatherMode;
  difficulty: DifficultyLevel;
  possessionFrames: { home: number; away: number };
  stoppageAdded: boolean;
  netBulge: { left: number; right: number };
}

export class FootballMatchEngine {
  public state: EngineState;
  private homeTeam: Team;
  private awayTeam: Team;
  private lastCommentaryTime: number = 0;

  constructor(homeTeam: Team, awayTeam: Team, weather: WeatherMode = 'night_floodlights', difficulty: DifficultyLevel = 'World Class') {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.state = this.initMatch(homeTeam, awayTeam, weather, difficulty);
  }

  private initMatch(homeTeam: Team, awayTeam: Team, weather: WeatherMode, difficulty: DifficultyLevel): EngineState {
    const players: MatchPlayer[] = [];
    const homeCoords = FORMATION_COORDINATES[homeTeam.formation]?.home || FORMATION_COORDINATES['4-3-3'].home;
    const awayCoords = FORMATION_COORDINATES[awayTeam.formation]?.away || FORMATION_COORDINATES['4-3-3'].away;

    // Initialize Home Players (11)
    homeTeam.players.slice(0, 11).forEach((p, idx) => {
      const slot = homeCoords[idx] || { x: 0.3, y: 0.5 };
      players.push({
        ...p,
        team: 'home',
        x: slot.x * PITCH_WIDTH,
        y: slot.y * PITCH_HEIGHT,
        vx: 0,
        vy: 0,
        targetX: slot.x * PITCH_WIDTH,
        targetY: slot.y * PITCH_HEIGHT,
        hasBall: idx === 9, // Striker has ball at kickoff
        stamina: 100,
        state: 'idle',
        skillCooldown: 0,
        actionTimer: 0,
        formationSlot: slot,
        number: idx === 0 ? 1 : idx === 9 ? 9 : idx === 10 ? 10 : idx + 1,
        facingAngle: 0,
      });
    });

    // Initialize Away Players (11)
    awayTeam.players.slice(0, 11).forEach((p, idx) => {
      const slot = awayCoords[idx] || { x: 0.7, y: 0.5 };
      players.push({
        ...p,
        team: 'away',
        x: slot.x * PITCH_WIDTH,
        y: slot.y * PITCH_HEIGHT,
        vx: 0,
        vy: 0,
        targetX: slot.x * PITCH_WIDTH,
        targetY: slot.y * PITCH_HEIGHT,
        hasBall: false,
        stamina: 100,
        state: 'idle',
        skillCooldown: 0,
        actionTimer: 0,
        formationSlot: slot,
        number: idx === 0 ? 1 : idx === 9 ? 9 : idx === 10 ? 10 : idx + 1,
        facingAngle: Math.PI,
      });
    });

    const striker = players.find(p => p.team === 'home' && p.position === 'ST') || players[9];
    const initialControlled = striker ? striker.id : players[0].id;

    return {
      timeSeconds: 0,
      stoppageTime: 2,
      isHalfTime: false,
      isFullTime: false,
      isPlaying: true,
      score: { home: 0, away: 0 },
      ball: {
        x: PITCH_WIDTH / 2,
        y: PITCH_HEIGHT / 2,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        spin: 0,
        possessionPlayerId: initialControlled,
        lastPossessionTeam: 'home',
        lastTouchTime: Date.now(),
      },
      players,
      controlledPlayerId: initialControlled,
      stats: {
        home: {
          possession: 50,
          shots: 0,
          shotsOnTarget: 0,
          xG: 0.0,
          passesCompleted: 0,
          passesAttempted: 0,
          tacklesWon: 0,
          tacklesAttempted: 0,
          fouls: 0,
          corners: 0,
          offsides: 0,
          saves: 0,
        },
        away: {
          possession: 50,
          shots: 0,
          shotsOnTarget: 0,
          xG: 0.0,
          passesCompleted: 0,
          passesAttempted: 0,
          tacklesWon: 0,
          tacklesAttempted: 0,
          fouls: 0,
          corners: 0,
          offsides: 0,
          saves: 0,
        },
      },
      commentary: [
        {
          id: 'c_init',
          minute: 0,
          text: `🔥 Kickoff at Champions Arena! ${homeTeam.name} faces ${awayTeam.name} in high-stakes Prime Cup clash!`,
          type: 'kickoff',
          timestamp: Date.now(),
        },
      ],
      latestGoalWalkout: null,
      tactics: { home: 'BAL', away: 'BAL' },
      weather,
      difficulty,
      possessionFrames: { home: 1, away: 1 },
      stoppageAdded: false,
      netBulge: { left: 0, right: 0 },
    };
  }

  public setTactic(team: 'home' | 'away', tactic: TacticMode) {
    this.state.tactics[team] = tactic;
    const teamName = team === 'home' ? this.homeTeam.shortCode : this.awayTeam.shortCode;
    const msg = tactic === 'ATT' ? `${teamName} shifts to All-Out Attack!` : tactic === 'DEF' ? `${teamName} sets up Park the Bus defence.` : `${teamName} reverts to Balanced formation.`;
    this.addCommentary(msg, 'info');
  }

  public setWeather(weather: WeatherMode) {
    this.state.weather = weather;
  }

  public setDifficulty(diff: DifficultyLevel) {
    this.state.difficulty = diff;
  }

  public togglePlayPause() {
    this.state.isPlaying = !this.state.isPlaying;
  }

  public addCommentary(text: string, type: CommentaryItem['type'] = 'info', speak: boolean = true) {
    const minute = Math.floor(this.state.timeSeconds / 60);
    const item: CommentaryItem = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      minute,
      text,
      type,
      timestamp: Date.now(),
    };
    this.state.commentary.unshift(item);
    if (this.state.commentary.length > 25) {
      this.state.commentary.pop();
    }
    if (speak && Date.now() - this.lastCommentaryTime > 2800) {
      this.lastCommentaryTime = Date.now();
      sound.speakCommentary(text);
    }
  }

  /** Update Loop called on 60 FPS RequestAnimationFrame */
  public update(dt: number, joystick: { active: boolean; dx: number; dy: number }) {
    if (!this.state.isPlaying || this.state.isHalfTime || this.state.isFullTime) {
      return;
    }

    // Match Clock progression (1 real second ~= 2.5 in-match seconds, standard football game pace)
    this.state.timeSeconds += dt * 2.5;
    const totalMinutes = this.state.timeSeconds / 60;

    // Halftime Check (45' + Stoppage)
    if (totalMinutes >= 45 && !this.state.isHalfTime && totalMinutes < 46) {
      this.state.isHalfTime = true;
      this.state.isPlaying = false;
      this.addCommentary(`⏸️ Halftime whistle blown! Score: ${this.homeTeam.shortCode} ${this.state.score.home} - ${this.state.score.away} ${this.awayTeam.shortCode}`, 'halftime');
      sound.playWhistle(true);
      return;
    }

    // Fulltime Check (90' + Stoppage)
    if (totalMinutes >= 90 + this.state.stoppageTime && !this.state.isFullTime) {
      this.state.isFullTime = true;
      this.state.isPlaying = false;
      this.addCommentary(`🏁 Full Time! Final Score: ${this.homeTeam.name} ${this.state.score.home} - ${this.state.score.away} ${this.awayTeam.name}`, 'whistle');
      sound.playWhistle(true);
      return;
    }

    // Decay net bulge
    this.state.netBulge.left *= 0.92;
    this.state.netBulge.right *= 0.92;

    // 1. Update Controlled Player from Joystick / Keyboard
    const controlled = this.state.players.find(p => p.id === this.state.controlledPlayerId);
    if (controlled) {
      if (joystick.active && (Math.abs(joystick.dx) > 0.05 || Math.abs(joystick.dy) > 0.05)) {
        const speed = controlled.state === 'sprinting' ? 4.6 : 3.4;
        const norm = Math.hypot(joystick.dx, joystick.dy) || 1;
        controlled.vx = (joystick.dx / norm) * speed * (controlled.stats.pac / 100);
        controlled.vy = (joystick.dy / norm) * speed * (controlled.stats.pac / 100);
        controlled.facingAngle = Math.atan2(joystick.dy, joystick.dx);
        controlled.state = controlled.state === 'sprinting' ? 'sprinting' : 'running';
      } else {
        controlled.vx *= 0.65;
        controlled.vy *= 0.65;
        if (controlled.state === 'running' || controlled.state === 'sprinting') {
          controlled.state = 'idle';
        }
      }
    }

    // 2. Update AI for Teammates & Opponents
    this.updateAI();

    // 3. Update Player Physics Positions & Pitch Boundaries
    this.updatePlayerPositions();

    // 4. Update 3D Ball Physics, Collisions & Goal Checks
    this.updateBallPhysics();

    // 5. Update Possession stats
    if (this.state.ball.possessionPlayerId) {
      const posPlayer = this.state.players.find(p => p.id === this.state.ball.possessionPlayerId);
      if (posPlayer) {
        if (posPlayer.team === 'home') this.state.possessionFrames.home++;
        else this.state.possessionFrames.away++;
        const total = this.state.possessionFrames.home + this.state.possessionFrames.away;
        this.state.stats.home.possession = Math.round((this.state.possessionFrames.home / total) * 100);
        this.state.stats.away.possession = 100 - this.state.stats.home.possession;
      }
    }

    // Auto-switch controlled player if away from ball and teammate is closer
    this.autoSwitchControlledPlayer();
  }

  private updateAI() {
    const ball = this.state.ball;
    const diffMultiplier = this.state.difficulty === 'Semi-Pro' ? 0.7 : this.state.difficulty === 'World Class' ? 1.0 : 1.25;

    this.state.players.forEach(player => {
      // Decrement timers
      if (player.skillCooldown > 0) player.skillCooldown--;
      if (player.actionTimer > 0) {
        player.actionTimer--;
        if (player.actionTimer <= 0 && (player.state === 'shooting' || player.state === 'passing' || player.state === 'tackling' || player.state === 'skill_move')) {
          player.state = 'idle';
        }
      }

      // If this is user controlled, skip AI logic
      if (player.id === this.state.controlledPlayerId) return;

      const isHome = player.team === 'home';
      const goalTargetX = isHome ? PITCH_WIDTH : 0;
      const ownGoalX = isHome ? 0 : PITCH_WIDTH;
      const tactic = isHome ? this.state.tactics.home : this.state.tactics.away;

      // Base target position from formation slot
      let baseX = player.formationSlot.x * PITCH_WIDTH;
      let baseY = player.formationSlot.y * PITCH_HEIGHT;

      // Tactic modifiers
      if (tactic === 'ATT') {
        baseX += isHome ? 70 : -70;
      } else if (tactic === 'DEF') {
        baseX += isHome ? -70 : 70;
      }

      // Ball follow bias (squad moves up/down with play)
      const ballProgress = ball.x / PITCH_WIDTH;
      if (player.position !== 'GK') {
        baseX += (ballProgress - 0.5) * (isHome ? 120 : 120);
      }

      // Goalkeeper AI
      if (player.position === 'GK') {
        const gkGoalX = isHome ? 55 : PITCH_WIDTH - 55;
        const targetGkY = Math.max(GOAL_TOP_Y + 15, Math.min(GOAL_BOTTOM_Y - 15, ball.y));
        player.targetX = gkGoalX;
        player.targetY = targetGkY;

        // Goalkeeper dive if shot is coming fast into box
        const distToBall = Math.hypot(player.x - ball.x, player.y - ball.y);
        if (distToBall < 110 && Math.abs(ball.vx) > 5) {
          player.targetX = ball.x;
          player.targetY = ball.y;
          if (distToBall < 35 && ball.z < 60) {
            // Save made!
            ball.vx = (Math.random() - 0.5) * 6;
            ball.vy = (Math.random() - 0.5) * 6;
            ball.possessionPlayerId = player.id;
            player.state = 'goalkeeping';
            sound.playKick(0.7);
            const teamKey = isHome ? 'home' : 'away';
            this.state.stats[teamKey].saves++;
            this.addCommentary(`🧤 Sensational save by ${player.shortName}!`, 'save');
          }
        }
      } else {
        // Outfield AI
        const distToBall = Math.hypot(player.x - ball.x, player.y - ball.y);

        // If player has ball
        if (player.hasBall || ball.possessionPlayerId === player.id) {
          // Push toward opponent goal
          player.targetX = goalTargetX;
          player.targetY = baseY;

          // Check if in shooting range
          const distToOppGoal = Math.hypot(player.x - goalTargetX, player.y - PITCH_HEIGHT / 2);
          if (distToOppGoal < 260 && Math.random() < 0.035 * diffMultiplier) {
            // AI takes a shot!
            this.executeShoot(player, 0.75 + Math.random() * 0.25);
          } else if (Math.random() < 0.03 * diffMultiplier) {
            // AI passes to forward teammate
            this.executeAIPass(player);
          }
        } else {
          // Off-ball movement: if closest to ball, challenge for possession
          const isClosest = this.isClosestTeammateToBall(player);
          if (isClosest && distToBall < 240) {
            player.targetX = ball.x;
            player.targetY = ball.y;

            // Slide tackle attempt
            if (distToBall < 42 && ball.possessionPlayerId && ball.possessionPlayerId !== player.id && Math.random() < 0.04 * diffMultiplier) {
              this.executeSlideTackle(player);
            }
          } else {
            player.targetX = baseX;
            player.targetY = baseY;
          }
        }
      }

      // Smooth movement towards target
      const dx = player.targetX - player.x;
      const dy = player.targetY - player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        const speed = player.hasBall ? 2.8 : 3.2;
        const moveSpeed = speed * (player.stats.pac / 100) * (player.team === 'away' ? diffMultiplier : 1.0);
        player.vx = (dx / dist) * Math.min(dist * 0.1, moveSpeed);
        player.vy = (dy / dist) * Math.min(dist * 0.1, moveSpeed);
        player.facingAngle = Math.atan2(dy, dx);
      } else {
        player.vx *= 0.5;
        player.vy *= 0.5;
      }
    });
  }

  private isClosestTeammateToBall(player: MatchPlayer): boolean {
    const ball = this.state.ball;
    const teammates = this.state.players.filter(p => p.team === player.team && p.position !== 'GK');
    let minDist = Infinity;
    let closestId = '';

    teammates.forEach(p => {
      const d = Math.hypot(p.x - ball.x, p.y - ball.y);
      if (d < minDist) {
        minDist = d;
        closestId = p.id;
      }
    });

    return closestId === player.id;
  }

  private updatePlayerPositions() {
    this.state.players.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Keep inside pitch lines
      p.x = Math.max(30, Math.min(PITCH_WIDTH - 30, p.x));
      p.y = Math.max(25, Math.min(PITCH_HEIGHT - 25, p.y));

      // Player-ball proximity possession grab
      if (!this.state.ball.possessionPlayerId && this.state.ball.z < 25) {
        const dist = Math.hypot(p.x - this.state.ball.x, p.y - this.state.ball.y);
        if (dist < 26) {
          this.state.ball.possessionPlayerId = p.id;
          this.state.ball.lastPossessionTeam = p.team;
          p.hasBall = true;
          this.state.players.forEach(other => {
            if (other.id !== p.id) other.hasBall = false;
          });
        }
      }
    });
  }

  private updateBallPhysics() {
    const ball = this.state.ball;
    const friction = this.state.weather === 'rain_slick' ? 0.985 : 0.965;
    const gravity = 0.42;

    if (ball.possessionPlayerId) {
      const carrier = this.state.players.find(p => p.id === ball.possessionPlayerId);
      if (carrier) {
        // Dribble position in front of carrier
        const forwardOffset = 18;
        ball.x = carrier.x + Math.cos(carrier.facingAngle) * forwardOffset;
        ball.y = carrier.y + Math.sin(carrier.facingAngle) * forwardOffset;
        ball.z = 0;
        ball.vx = carrier.vx;
        ball.vy = carrier.vy;
        ball.vz = 0;
        return;
      }
    }

    // Free flight ball physics
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.z += ball.vz;

    // Apply Ground Friction
    ball.vx *= friction;
    ball.vy *= friction;

    // Apply Gravity in Z
    if (ball.z > 0) {
      ball.vz -= gravity;
    } else {
      ball.z = 0;
      if (Math.abs(ball.vz) > 1.2) {
        ball.vz = -ball.vz * 0.55; // bounce
        sound.playKick(0.3);
      } else {
        ball.vz = 0;
      }
    }

    // Check Woodwork / Goal Post Collisions
    this.checkWoodworkCollision();

    // Check Goal Line Net Entries
    this.checkGoal();

    // Out of bounds check
    this.checkPitchBounds();
  }

  private checkWoodworkCollision() {
    const ball = this.state.ball;
    // Left posts (x: 10, y: GOAL_TOP_Y and GOAL_BOTTOM_Y)
    const leftPostTop = { x: 15, y: GOAL_TOP_Y };
    const leftPostBottom = { x: 15, y: GOAL_BOTTOM_Y };
    const rightPostTop = { x: PITCH_WIDTH - 15, y: GOAL_TOP_Y };
    const rightPostBottom = { x: PITCH_WIDTH - 15, y: GOAL_BOTTOM_Y };

    [leftPostTop, leftPostBottom, rightPostTop, rightPostBottom].forEach(post => {
      const d = Math.hypot(ball.x - post.x, ball.y - post.y);
      if (d < 14 && ball.z < 65) {
        ball.vx = -ball.vx * 0.85 + (Math.random() - 0.5) * 4;
        ball.vy = -ball.vy * 0.85;
        ball.vz = Math.random() * 4 + 2;
        sound.playWoodwork();
        this.addCommentary(`💥 OFF THE WOODWORK! Stunner off the goalpost!`, 'woodwork');
      }
    });
  }

  private checkGoal() {
    const ball = this.state.ball;

    // Right Goal (Home scores!)
    if (ball.x >= PITCH_WIDTH - 12 && ball.y >= GOAL_TOP_Y && ball.y <= GOAL_BOTTOM_Y && ball.z <= 65) {
      this.triggerGoal('home');
      this.state.netBulge.right = 35;
      return;
    }

    // Left Goal (Away scores!)
    if (ball.x <= 12 && ball.y >= GOAL_TOP_Y && ball.y <= GOAL_BOTTOM_Y && ball.z <= 65) {
      this.triggerGoal('away');
      this.state.netBulge.left = 35;
      return;
    }
  }

  private triggerGoal(scoringTeam: 'home' | 'away') {
    if (this.state.latestGoalWalkout) return; // already triggered
    this.state.score[scoringTeam]++;
    sound.playGoalCelebration();
    sound.playWhistle(false);

    // Calculate shot attributes
    const scorerTeamPlayers = this.state.players.filter(p => p.team === scoringTeam);
    const scorer = scorerTeamPlayers.find(p => p.id === this.state.ball.possessionPlayerId) ||
      scorerTeamPlayers.find(p => p.position === 'ST') || scorerTeamPlayers[9];

    const distanceMeters = Math.round((Math.random() * 16 + 14) * 10) / 10;
    const shotSpeedKmh = Math.round((Math.random() * 35 + 98) * 10) / 10;
    const styles = ['Top-Corner Rocket', 'Curling Trivela', 'Thunderbolt Volley', 'Bullet Header', 'Acrobatic Bicycle'];
    const style = styles[Math.floor(Math.random() * styles.length)];

    const walkout: GoalWalkoutEvent = {
      scorer,
      team: scoringTeam,
      minute: Math.floor(this.state.timeSeconds / 60),
      shotSpeedKmh,
      distanceMeters,
      executionStyle: style,
      scoreHome: this.state.score.home,
      scoreAway: this.state.score.away,
    };

    this.state.latestGoalWalkout = walkout;
    this.state.isPlaying = false;

    this.addCommentary(
      `⚽ GOOOAAALLL! ${scorer.name} fires a ${shotSpeedKmh} km/h ${style} into the back of the net! (${scoringTeam === 'home' ? this.homeTeam.name : this.awayTeam.name})`,
      'goal'
    );
  }

  public resumeAfterGoal() {
    this.state.latestGoalWalkout = null;
    this.resetKickoff(this.state.ball.lastPossessionTeam === 'home' ? 'away' : 'home');
    this.state.isPlaying = true;
  }

  private resetKickoff(kickoffTeam: 'home' | 'away') {
    const homeCoords = FORMATION_COORDINATES[this.homeTeam.formation]?.home || FORMATION_COORDINATES['4-3-3'].home;
    const awayCoords = FORMATION_COORDINATES[this.awayTeam.formation]?.away || FORMATION_COORDINATES['4-3-3'].away;

    this.state.players.forEach(p => {
      const idx = this.state.players.indexOf(p);
      const isHome = p.team === 'home';
      const slot = isHome ? homeCoords[idx % 11] : awayCoords[idx % 11];
      p.x = slot.x * PITCH_WIDTH;
      p.y = slot.y * PITCH_HEIGHT;
      p.vx = 0;
      p.vy = 0;
      p.hasBall = false;
      p.state = 'idle';
    });

    const starter = this.state.players.find(p => p.team === kickoffTeam && (p.position === 'ST' || p.position === 'CAM')) || this.state.players[0];
    starter.hasBall = true;
    starter.x = PITCH_WIDTH / 2;
    starter.y = PITCH_HEIGHT / 2;

    this.state.ball = {
      x: PITCH_WIDTH / 2,
      y: PITCH_HEIGHT / 2,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      spin: 0,
      possessionPlayerId: starter.id,
      lastPossessionTeam: kickoffTeam,
      lastTouchTime: Date.now(),
    };

    if (kickoffTeam === 'home') {
      this.state.controlledPlayerId = starter.id;
    }
  }

  private checkPitchBounds() {
    const ball = this.state.ball;
    // Top / Bottom Out of bounds
    if (ball.y < 15 || ball.y > PITCH_HEIGHT - 15) {
      ball.y = Math.max(25, Math.min(PITCH_HEIGHT - 25, ball.y));
      ball.vx *= 0.3;
      ball.vy = 0;
      if (!ball.possessionPlayerId) {
        this.addCommentary('Throw-in on the touchline.', 'info', false);
      }
    }

    // Left / Right Out of bounds (behind goal)
    if (ball.x < 15 && !(ball.y >= GOAL_TOP_Y && ball.y <= GOAL_BOTTOM_Y)) {
      ball.x = 45;
      ball.vx = 0;
      ball.vy = 0;
      this.state.stats.home.corners++;
      this.addCommentary('Corner kick awarded!', 'info');
    } else if (ball.x > PITCH_WIDTH - 15 && !(ball.y >= GOAL_TOP_Y && ball.y <= GOAL_BOTTOM_Y)) {
      ball.x = PITCH_WIDTH - 45;
      ball.vx = 0;
      ball.vy = 0;
      this.state.stats.away.corners++;
      this.addCommentary('Goal kick taken.', 'info');
    }
  }

  private autoSwitchControlledPlayer() {
    const controlled = this.state.players.find(p => p.id === this.state.controlledPlayerId);
    if (!controlled) return;

    // If opponent has ball, switch to closest home defender
    if (this.state.ball.lastPossessionTeam === 'away' || !this.state.ball.possessionPlayerId) {
      let closestHome: MatchPlayer | null = null;
      let minDistance = Infinity;

      this.state.players.filter(p => p.team === 'home' && p.position !== 'GK').forEach(p => {
        const d = Math.hypot(p.x - this.state.ball.x, p.y - this.state.ball.y);
        if (d < minDistance) {
          minDistance = d;
          closestHome = p;
        }
      });

      if (closestHome && minDistance < 180 && closestHome.id !== controlled.id) {
        this.state.controlledPlayerId = closestHome.id;
      }
    }
  }

  // =================== PLAYER USER ACTIONS ===================

  public executeShoot(player: MatchPlayer, power: number = 0.85) {
    const isHome = player.team === 'home';
    const targetGoalX = isHome ? PITCH_WIDTH - 10 : 10;
    const targetGoalY = GOAL_TOP_Y + Math.random() * (GOAL_BOTTOM_Y - GOAL_TOP_Y);

    const dx = targetGoalX - player.x;
    const dy = targetGoalY - player.y;
    const dist = Math.hypot(dx, dy);

    player.state = 'shooting';
    player.actionTimer = 22;
    player.hasBall = false;

    // Release ball
    this.state.ball.possessionPlayerId = null;
    const shotSpeed = (14 + power * 12) * (player.stats.sho / 100);
    this.state.ball.vx = (dx / dist) * shotSpeed;
    this.state.ball.vy = (dy / dist) * shotSpeed + (Math.random() - 0.5) * 2;
    this.state.ball.vz = (3 + power * 4.5);
    this.state.ball.lastPossessionTeam = player.team;

    // Update Stats & Sound
    const teamKey = isHome ? 'home' : 'away';
    this.state.stats[teamKey].shots++;
    if (dist < 320) {
      this.state.stats[teamKey].shotsOnTarget++;
      this.state.stats[teamKey].xG = Math.round((this.state.stats[teamKey].xG + Math.min(0.75, 120 / dist)) * 100) / 100;
    }
    sound.playShoot(power);

    this.addCommentary(`💥 Screamer let fly by ${player.shortName}!`, 'shot');
  }

  public executePass(player: MatchPlayer, isThrough: boolean = false) {
    const teammates = this.state.players.filter(p => p.team === player.team && p.id !== player.id && p.position !== 'GK');
    if (teammates.length === 0) return;

    // Find best teammate in facing direction
    let bestTeammate: MatchPlayer = teammates[0];
    let bestScore = -Infinity;

    teammates.forEach(tm => {
      const dx = tm.x - player.x;
      const dy = tm.y - player.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const angleDiff = Math.abs(Math.atan2(Math.sin(angle - player.facingAngle), Math.cos(angle - player.facingAngle)));

      // Higher score for teammates in line of sight and forward
      const isForward = player.team === 'home' ? dx > 0 : dx < 0;
      const score = 1000 - dist * 1.5 - angleDiff * 350 + (isForward ? 200 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestTeammate = tm;
      }
    });

    player.state = 'passing';
    player.actionTimer = 16;
    player.hasBall = false;

    // Target coordinates
    let targetX = bestTeammate.x;
    let targetY = bestTeammate.y;
    if (isThrough) {
      const leadOffset = player.team === 'home' ? 85 : -85;
      targetX += leadOffset;
    }

    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const dist = Math.hypot(dx, dy);
    const speed = (isThrough ? 14 : 11) * (player.stats.pas / 100);

    this.state.ball.possessionPlayerId = null;
    this.state.ball.vx = (dx / dist) * speed;
    this.state.ball.vy = (dy / dist) * speed;
    this.state.ball.vz = isThrough ? 1.8 : 0;
    this.state.ball.lastPossessionTeam = player.team;

    const teamKey = player.team;
    this.state.stats[teamKey].passesAttempted++;
    this.state.stats[teamKey].passesCompleted++;

    sound.playKick(0.7);

    // Switch controlled player to receiving teammate
    if (player.team === 'home') {
      setTimeout(() => {
        this.state.controlledPlayerId = bestTeammate.id;
      }, 250);
    }
  }

  private executeAIPass(player: MatchPlayer) {
    this.executePass(player, Math.random() > 0.6);
  }

  public executeSkillMove(player: MatchPlayer, skillType: 'roulette' | 'rainbow' | 'stepover' = 'roulette') {
    if (player.skillCooldown > 0) return;
    player.skillCooldown = 75;
    player.state = 'skill_move';
    player.actionTimer = 25;

    sound.playSkillMove();

    // Burst of speed in facing direction
    const burst = skillType === 'rainbow' ? 5.8 : 5.0;
    player.vx = Math.cos(player.facingAngle) * burst;
    player.vy = Math.sin(player.facingAngle) * burst;

    if (skillType === 'rainbow' && player.hasBall) {
      this.state.ball.vz = 5.2; // Rainbow flick lifts ball over defender
    }

    this.addCommentary(`✨ 5★ ${skillType.toUpperCase()} by ${player.shortName}! Sublime trick!`, 'skill');
  }

  public executeSlideTackle(player: MatchPlayer) {
    player.state = 'tackling';
    player.actionTimer = 28;
    sound.playTackle();

    // Lunge forward
    player.vx = Math.cos(player.facingAngle) * 5.8;
    player.vy = Math.sin(player.facingAngle) * 5.8;

    const teamKey = player.team;
    this.state.stats[teamKey].tacklesAttempted++;

    // Proximity check against opponent ball carrier
    const ball = this.state.ball;
    const distToBall = Math.hypot(player.x - ball.x, player.y - ball.y);
    if (distToBall < 48) {
      if (Math.random() < (player.stats.def / 125)) {
        // Clean tackle won!
        ball.possessionPlayerId = player.id;
        ball.lastPossessionTeam = player.team;
        player.hasBall = true;
        this.state.stats[teamKey].tacklesWon++;
        this.addCommentary(`🛡️ Crunchy sliding tackle won by ${player.shortName}!`, 'tackle');
      } else {
        // Foul conceded
        this.state.stats[teamKey].fouls++;
        sound.playWhistle(false);
        this.addCommentary(`⚠️ Referee blows for a foul committed by ${player.shortName}!`, 'foul');
      }
    }
  }

  public switchPlayerManual() {
    const controlled = this.state.players.find(p => p.id === this.state.controlledPlayerId);
    const homePlayers = this.state.players.filter(p => p.team === 'home' && p.id !== controlled?.id && p.position !== 'GK');
    if (homePlayers.length === 0) return;

    // Pick closest to ball
    let closest = homePlayers[0];
    let minD = Infinity;
    homePlayers.forEach(p => {
      const d = Math.hypot(p.x - this.state.ball.x, p.y - this.state.ball.y);
      if (d < minD) {
        minD = d;
        closest = p;
      }
    });

    this.state.controlledPlayerId = closest.id;
    sound.playClick(720);
  }
}
