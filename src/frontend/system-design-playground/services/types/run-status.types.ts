// Enum constants matching backend RunStatus
export const RunStatus = {
  Pending: 0,
  Processing: 1,
  Completed: 2,
  Failed: 3,
  Cancelled: 4,
} as const;

export type RunStatusValue = typeof RunStatus[keyof typeof RunStatus];

// Helper functions
export const RunStatusLabels: Record<RunStatusValue, string> = {
  [RunStatus.Pending]: 'Pending',
  [RunStatus.Processing]: 'Processing',
  [RunStatus.Completed]: 'Completed',
  [RunStatus.Failed]: 'Failed',
  [RunStatus.Cancelled]: 'Cancelled',
};

export function getRunStatusLabel(status: RunStatusValue): string {
  return RunStatusLabels[status] || 'Unknown';
}
