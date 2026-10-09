// Real-time User Presence Tracker (Online / Offline status)

class PresenceManager {
  private userSockets: Map<number, Set<string>> = new Map();

  /**
   * Registers a connected socket for a user.
   * Returns true if the user transitioned from offline to online.
   */
  public userConnected(userId: number, socketId: string): boolean {
    let sockets = this.userSockets.get(userId);
    const wasOnline = Boolean(sockets && sockets.size > 0);
    if (!sockets) {
      sockets = new Set<string>();
      this.userSockets.set(userId, sockets);
    }
    sockets.add(socketId);
    return !wasOnline;
  }

  /**
   * Removes a socket for a user.
   * Returns true if user has no more active sockets (transitioned to offline).
   */
  public userDisconnected(userId: number, socketId: string): boolean {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return false;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      return true;
    }
    return false;
  }

  /**
   * Cleans up by socket ID if user ID wasn't explicitly available.
   */
  public removeSocket(socketId: string): { userId: number; becameOffline: boolean } | null {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          return { userId, becameOffline: true };
        }
        return { userId, becameOffline: false };
      }
    }
    return null;
  }

  /**
   * Checks if a user is currently online.
   */
  public isOnline(userId: number): boolean {
    const sockets = this.userSockets.get(userId);
    return Boolean(sockets && sockets.size > 0);
  }

  /**
   * Returns an array of all currently online user IDs.
   */
  public getOnlineUserIds(): number[] {
    return Array.from(this.userSockets.keys());
  }
}

export const presenceManager = new PresenceManager();
