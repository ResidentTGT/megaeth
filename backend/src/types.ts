export type LeaderboardEntry = {
  rank: number;
  xAccount?: string;
  mainWalletAddress: string;
  totalPoints: number;
  weeklyPointsChange: number;
};

export type LeaderboardPayload = {
  weekly: LeaderboardEntry[];
  all: LeaderboardEntry[];
};

export type LeaderboardResponse = {
  updatedAt: string;
  entries: LeaderboardEntry[];
};
