export interface LSCGameCenterPlugin {
  authenticate(): Promise<{ authenticated: boolean; playerName?: string }>;
  status(): Promise<{ authenticated: boolean; playerName?: string }>;
  reportScore(options: { leaderboardId: string; score: number }): Promise<{ submitted: boolean }>;
  reportAchievement(options: { achievementId: string; percentComplete?: number }): Promise<{ submitted: boolean }>;
  showDashboard(options?: { section?: 'dashboard' | 'leaderboards' | 'achievements' }): Promise<{ presented: boolean }>;
}
export declare const LSCGameCenter: LSCGameCenterPlugin;
