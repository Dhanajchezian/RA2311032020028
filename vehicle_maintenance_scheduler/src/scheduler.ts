import {VehiclePayload} from './types';

export interface SchedulerOutcome {
  selected: VehiclePayload[];
  totalImpact: number;
  totalDuration: number;
}

function toIntegerCapacity(hours: number): number {
  return Math.round(hours);
}

export function computeOptimalSchedule(
  vehicles: VehiclePayload[],
  availableHours: number,
): SchedulerOutcome {
  const capacity = toIntegerCapacity(availableHours);
  const itemCount = vehicles.length;

  const dp: number[][] = Array.from({ length: itemCount + 1 }, () =>
    new Array(capacity + 1).fill(0),
  );

  for (let i = 1; i <= itemCount; i += 1) {
    const vehicle = vehicles[i - 1];
    const weight = toIntegerCapacity(vehicle.duration);
    const value = vehicle.impact;

    for (let hour = 0; hour <= capacity; hour += 1) {
      if (weight > hour) {
        dp[i][hour] = dp[i - 1][hour];
        continue;
      }

      const skipImpact = dp[i - 1][hour];
      const takeImpact = dp[i - 1][hour - weight] + value;
      dp[i][hour] = takeImpact > skipImpact ? takeImpact : skipImpact;
    }
  }

  let remaining = capacity;
  const selected: VehiclePayload[] = [];

  for (let i = itemCount; i > 0 && remaining >= 0; i -= 1) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      const vehicle = vehicles[i - 1];
      selected.push(vehicle);
      remaining -= toIntegerCapacity(vehicle.duration);
    }
  }

  const totalDuration = selected.reduce((sum, item) => sum + item.duration, 0);
  const totalImpact = dp[itemCount][capacity];

  return {
    selected: selected.reverse(),
    totalImpact,
    totalDuration,
  };
}
