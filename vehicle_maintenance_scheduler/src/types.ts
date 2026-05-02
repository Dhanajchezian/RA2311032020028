export interface DepotPayload {
  availableMechanicHours: number;
}

export interface VehiclePayload {
  id: string;
  duration: number;
  impact: number;
}

export interface SchedulerResult {
  selectedVehicles: VehiclePayload[];
  totalImpact: number;
  totalDuration: number;
  availableHours: number;
}
