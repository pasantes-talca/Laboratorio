import { expect, it, vi } from 'vitest';
import { loadAllPages } from './dashboardApi';

it('loads history beyond the first page', async () => {
  const getPage = vi.fn()
    .mockResolvedValueOnce([{ id: 3 }, { id: 2 }])
    .mockResolvedValueOnce([{ id: 1 }]);
  expect(await loadAllPages(getPage, 2)).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
  expect(getPage).toHaveBeenNthCalledWith(2, { limit: 2, offset: 2 });
});

it('rejects a source when a later page fails instead of reporting incomplete history', async () => {
  const getPage = vi.fn().mockResolvedValueOnce([{ id: 2 }, { id: 1 }]).mockRejectedValueOnce(new Error('offline'));
  await expect(loadAllPages(getPage, 2)).rejects.toThrow('offline');
});
