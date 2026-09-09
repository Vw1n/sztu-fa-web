import type { CareerData } from '../../Matches/utils/matchData';

/** 赛季行数据（复用 CareerData 中的 seasons 元素类型） */
export type CareerSeasonRow = CareerData['seasons'][number];

/** PlayerCareerHeader 组件 props —— 只接收头部展示所需的最小数据 */
export interface PlayerCareerHeaderProps {
  photo: string | null;
  jerseyNumber: string;
  playerName: string;
  teamName: string;
  status: string;
}

/** PlayerSeasonHistory 组件 props —— 只接收排序后的赛季行数组 */
export interface PlayerSeasonHistoryProps {
  seasons: CareerSeasonRow[];
}

/** PlayerCareerStats 组件 props —— 只接收数值 DTO，不感知完整 CareerData */
export interface PlayerCareerStatsProps {
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
}

/** PlayerDisciplineStats 组件 props —— 只接收红黄牌数值 */
export interface PlayerDisciplineStatsProps {
  totalYellow: number;
  totalRed: number;
}
