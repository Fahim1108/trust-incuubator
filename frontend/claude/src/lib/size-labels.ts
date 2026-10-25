import type { SizeGuide } from '@/types';

/** Only label a clothing size when its own guide explicitly supplies a chest measurement. */
export function sizeLabelsFromGuide(guide?: SizeGuide | null): Record<string, string> {
  if (!guide || guide.unit !== 'inches') return {};
  const chest = guide.columns.findIndex(column => column.toLowerCase() === 'chest');
  if (chest < 0 || guide.columns[0]?.toLowerCase() !== 'size') return {};
  return Object.fromEntries(guide.rows.filter(row => row[0] && row[chest]).map(row => [row[0], `${row[0]} (${row[chest]})`]));
}
