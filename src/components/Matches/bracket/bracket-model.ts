import type { Match } from '../../../types';
import { getWinnerTeamId } from '../utils/matchOutcome';
import type {
  BracketModel,
  BracketRoundKey,
  BracketSlot,
} from './bracket.types';

/* -------------------------------------------------------------------------- */
/*  内部工具：规范化轮次名                                                      */
/* -------------------------------------------------------------------------- */

const KNOWN_ROUND_UPPER: Record<string, BracketRoundKey> = {
  R16: 'R16',
  ROUND_OF_16: 'R16',
  '1/8': 'R16',
  '16强': 'R16',
  EIGHTH_FINALS: 'R16',
  QF: 'QF',
  QUARTER_FINALS: 'QF',
  '1/4': 'QF',
  '8强': 'QF',
  SF: 'SF',
  SEMI_FINALS: 'SF',
  SEMIFINALS: 'SF',
  '1/2': 'SF',
  '4强': 'SF',
  F: 'F',
  FINAL: 'F',
  FINALS: 'F',
  决赛: 'F',
  冠军赛: 'F',
};

const THIRD_PLACE_HINTS = [
  '3RD',
  '3RD_PLACE',
  'THIRD_PLACE',
  '34',
  '34名',
  '三四名',
  '季军',
  '3/4',
  'BRONZE',
];

/**
 * 将 match.knockoutRound 或 matchName 规范化成内部轮次名。
 * 只识别 R16 / QF / SF / F / 3RD，无法归并的返回 null。
 */
export function normalizeBracketRound(match: Match): BracketRoundKey | null {
  const raw = (match.knockoutRound || '').trim();
  if (raw) {
    const upper = raw.toUpperCase();
    if (KNOWN_ROUND_UPPER[upper]) return KNOWN_ROUND_UPPER[upper];
    if (THIRD_PLACE_HINTS.some((h) => upper === h)) return '3RD';
  }
  const name = (match.matchName || '').trim();
  if (!name) return null;
  const upperName = name.toUpperCase();
  if (THIRD_PLACE_HINTS.some((h) => upperName.includes(h))) return '3RD';
  return null;
}

/* -------------------------------------------------------------------------- */
/*  内部工具：根据 (round, index) 在 matches 里找单场比赛                         */
/* -------------------------------------------------------------------------- */

function findMatchByRoundAndIndex(
  matches: Match[],
  round: BracketRoundKey,
  index: number,
): Match | null {
  return (
    matches.find((m) => {
      const normalized = normalizeBracketRound(m);
      if (normalized !== round) return false;

      if (round === '3RD') {
        // 三四名比赛常常没有 index，只要轮次对就返回第一个匹配
        const idx = m.knockoutMatchIndex;
        return (
          idx === undefined ||
          idx === null ||
          Number(idx) === index ||
          Number(idx) === 0
        );
      }

      const idx = m.knockoutMatchIndex;
      return Number(idx) === index || (!idx && index === 1);
    }) || null
  );
}

/* -------------------------------------------------------------------------- */
/*  内部工具：生成固定数量的槽位数组                                               */
/* -------------------------------------------------------------------------- */

function makeSlots(
  matches: Match[],
  round: BracketRoundKey,
  count: number,
): BracketSlot[] {
  const slots: BracketSlot[] = [];
  for (let i = 1; i <= count; i += 1) {
    slots.push({
      round,
      index: i,
      match: findMatchByRoundAndIndex(matches, round, i),
    });
  }
  return slots;
}

/* -------------------------------------------------------------------------- */
/*  内部工具：从决赛 match 推导冠军队伍                                           */
/* -------------------------------------------------------------------------- */

function getChampionFromFinal(
  finalMatch: Match | null,
): { teamName: string; teamLogo?: string | null } | null {
  if (!finalMatch || finalMatch.status !== 'completed') return null;
  const winnerId = getWinnerTeamId(finalMatch);
  if (winnerId === finalMatch.homeTeamId && finalMatch.homeTeam) {
    return {
      teamName: finalMatch.homeTeam.teamName,
      teamLogo: finalMatch.homeTeam.teamLogo || null,
    };
  }
  if (winnerId === finalMatch.awayTeamId && finalMatch.awayTeam) {
    return {
      teamName: finalMatch.awayTeam.teamName,
      teamLogo: finalMatch.awayTeam.teamLogo || null,
    };
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  纯函数主入口：buildBracketModel                                              */
/*                                                                              */
/*  职责：                                                                      */
/*    1. 规范化比赛轮次名 (normalizeBracketRound)                                */
/*    2. 按 (round, index) 填充固定大小的槽位数组                                 */
/*    3. 判断是否存在 1/8 / 1/4 决赛轮                                           */
/*    4. 从决赛推导冠军                                                         */
/*                                                                              */
/*  不做：                                                                      */
/*    - 不引用 React / 浏览器 API / DOM                                          */
/*    - 不生成 CSS class / SVG 坐标 / 媒体查询                                   */
/*    - 不重复请求比赛数据                                                       */
/* -------------------------------------------------------------------------- */

export function buildBracketModel(matches: Match[]): BracketModel {
  const safeMatches = Array.isArray(matches) ? matches : [];

  const roundOf16 = makeSlots(safeMatches, 'R16', 8);
  const quarterFinals = makeSlots(safeMatches, 'QF', 4);
  const semiFinals = makeSlots(safeMatches, 'SF', 2);
  const finalSlot = (() => {
    const match = findMatchByRoundAndIndex(safeMatches, 'F', 1);
    return match ? { round: 'F' as const, index: 1, match } : null;
  })();
  const thirdPlaceSlot = (() => {
    const match = findMatchByRoundAndIndex(safeMatches, '3RD', 1);
    return match ? { round: '3RD' as const, index: 1, match } : null;
  })();

  const hasRoundOf16 = roundOf16.some((s) => s.match !== null);
  const hasQuarterFinals = quarterFinals.some((s) => s.match !== null);

  const champion = getChampionFromFinal(finalSlot?.match ?? null);

  return {
    roundOf16,
    quarterFinals,
    semiFinals,
    thirdPlace: thirdPlaceSlot,
    final: finalSlot,
    hasQuarterFinals,
    hasRoundOf16,
    champion,
  };
}
