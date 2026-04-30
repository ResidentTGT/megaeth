export type LeaderboardEntry = {
  rank: number;
  xAccount?: string;
  mainWalletAddress: string;
  totalPoints: number;
  weeklyPointsChange: number;
};

export type LeaderboardResponse = {
  updatedAt: string;
  stats?: {
    entriesCount: number;
    totalPointsSum: number;
    averageTotalPoints: number;
  };
  entries: LeaderboardEntry[];
};
