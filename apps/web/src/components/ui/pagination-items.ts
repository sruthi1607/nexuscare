export type PageItem = number | 'ellipsis';

/**
 * Page buttons to show: always first and last, the current page with one neighbour on each side,
 * and ellipses for gaps. E.g. (6, 12) gives [1, ellipsis, 5, 6, 7, ellipsis, 12].
 */
export function getPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= pageCount - 2) {
    [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p));
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((p, i) => {
    const previous = sorted[i - 1];
    if (previous !== undefined && p - previous > 1) items.push('ellipsis');
    items.push(p);
  });
  return items;
}
