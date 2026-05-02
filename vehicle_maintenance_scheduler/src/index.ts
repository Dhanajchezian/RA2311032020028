import {fetchDepot, fetchVehicles, schedulerLogger} from './api';
import {computeOptimalSchedule} from './scheduler';
import {SchedulerResult} from './types';

async function main(): Promise<void> {
  const depot = await fetchDepot();
  const vehicles = await fetchVehicles();

  const outcome = computeOptimalSchedule(vehicles, depot.availableMechanicHours);
  const result: SchedulerResult = {
    selectedVehicles: outcome.selected,
    totalImpact: outcome.totalImpact,
    totalDuration: outcome.totalDuration,
    availableHours: depot.availableMechanicHours,
  };

  await schedulerLogger.log('backend', 'info', 'service', 'Vehicle maintenance schedule computed', undefined, {
    selectedCount: result.selectedVehicles.length,
    totalImpact: result.totalImpact,
    totalDuration: result.totalDuration,
  });

  process.stdout.write(JSON.stringify(result, null, 2));
}

main().catch(async (error) => {
  await schedulerLogger.log('backend', 'error', 'service', 'Scheduler execution failed', undefined, {
    reason: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
