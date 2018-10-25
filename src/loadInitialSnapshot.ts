import { load } from 'test-progress-tracker';
import { WorkspaceFolderTestSnapshot } from './interfaces';

export async function loadInitialSnapshot(rootDir: string): Promise<WorkspaceFolderTestSnapshot | undefined> {
  const result = (await load({ rootDir })).reduceRight((p, v) => {
    if (p.coverage && p.full) {
      return p
    }
    if (!p.latest) p.latest = v
    if (v.coverage) p.coverage = v
    if (!v.filtered) p.full = v

    return p
    // return p && v.coverage ? v : p
  }, {} as WorkspaceFolderTestSnapshot)

  return result.latest ? result : undefined
}
