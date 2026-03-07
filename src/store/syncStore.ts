import { create } from 'zustand';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: Date | null;

  setStatus: (status: SyncStatus) => void;
  setPendingCount: (count: number) => void;
  setLastSynced: (date: Date) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,

  setStatus: (status) => set({ status }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastSynced: (lastSyncedAt) => set({ lastSyncedAt }),
}));
