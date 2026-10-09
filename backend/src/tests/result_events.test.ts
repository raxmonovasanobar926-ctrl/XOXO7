import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/index.js';
import { gameManager, RoomPlayer } from '../modules/games/gameManager.js';

type Emit = { room: string; event: string; data: any };

function makeFakeIO(log: Emit[]) {
  return {
    to(room: string) {
      return { emit: (event: string, data: any) => log.push({ room, event, data }) };
    },
    in() {
      return { socketsJoin() {} };
    },
    emit() {},
    sockets: { sockets: new Map() },
  } as any;
}

async function startPvP(stake: number, tag: string) {
  const u1 = await db.createUser(9992000 + Math.floor(Math.random() * 1e5), `ResA_${tag}_${Date.now()}`, 'fox');
  const u2 = await db.createUser(9993000 + Math.floor(Math.random() * 1e5), `ResB_${tag}_${Date.now()}`, 'ninja');
  const mk = (u: any, sock: string, symbol: 'X' | 'O'): RoomPlayer => ({
    userId: u.id,
    nickname: u.nickname,
    avatarUrl: u.avatar_url,
    socketId: sock,
    symbol,
    rpsChoice: null,
    isConnected: true,
  });
  const roomId = `res_${tag}_${Date.now()}_${Math.random()}`;
  await gameManager.createRoom(roomId, mk(u1, 's1', 'X'), stake, false);
  await gameManager.joinRoom(roomId, mk(u2, 's2', 'O'));
  const room = gameManager.getRoom(roomId)!;
  await gameManager.startRPSStage(room);
  room.player1.symbol = 'X';
  room.player2!.symbol = 'O';
  room.status = 'in_progress';
  return { u1, u2, room };
}

describe('Game-result events reach BOTH clients (win / lose / draw / forfeit / AI)', () => {
  const log: Emit[] = [];
  beforeEach(() => {
    log.length = 0;
    gameManager.setIO(makeFakeIO(log));
  });

  it('PvP win: ONE game_over broadcast to the room; winnerId lets each client derive win vs lose', async () => {
    const { u1, u2, room } = await startPvP(2, 'win');
    await (gameManager as any).handleGameOver(room, 'X');
    const evs = log.filter(e => e.event === 'game_over');
    expect(evs.length).toBe(1);
    expect(evs[0].room).toBe(room.roomId); // room broadcast -> both sockets receive it
    expect(evs[0].data.winnerId).toBe(u1.id);
    expect(evs[0].data.winnerId).not.toBe(u2.id);
    expect(evs[0].data.isAiGame).toBe(false);
  });

  it('PvP draw: game_draw broadcast to the room (no winnerId), payload has stake refund', async () => {
    const { room } = await startPvP(4, 'draw');
    await (gameManager as any).handleGameDraw(room);
    const evs = log.filter(e => e.event === 'game_draw');
    expect(evs.length).toBe(1);
    expect(evs[0].room).toBe(room.roomId);
    expect(evs[0].data.prize).toBe(4);
    expect(log.some(e => e.event === 'game_over')).toBe(false);
  });

  it('Forfeit: remaining player gets opponent_left (with winnerId) and game_over, same winner', async () => {
    const { u1, u2, room } = await startPvP(6, 'ff');
    await gameManager.leaveRoom(room.roomId, u2.id);
    const left = log.find(e => e.event === 'opponent_left');
    const over = log.find(e => e.event === 'game_over');
    expect(left).toBeDefined();
    expect(over).toBeDefined();
    expect(left!.data.winnerId).toBe(u1.id);
    expect(over!.data.winnerId).toBe(u1.id);
    expect(left!.room).toBe(room.roomId);
    expect(over!.room).toBe(room.roomId);
  });

  it('AI game: bot win still broadcasts game_over with a non-human winnerId (human client => lose)', async () => {
    const u = await db.createUser(9994000 + Math.floor(Math.random() * 1e5), `ResAI_${Date.now()}`, 'fox');
    const res = await gameManager.createAIGame(u.id, 'easy', 'sock_ai_res');
    expect(res.success).toBe(true);
    const room = res.room!;
    room.player1.symbol = 'X';
    room.player2!.symbol = 'O';
    await (gameManager as any).handleGameOver(room, 'O');
    const ev = log.find(e => e.event === 'game_over');
    expect(ev).toBeDefined();
    expect(ev!.data.winnerId).not.toBe(u.id);
    expect(ev!.data.isAiGame).toBe(true);
  });
});
