export type SharedMetric = {
  label: string;
  value: number;
  unit: '%';
};

export type SharedRegionActivity = {
  region: string;
  value: number;
};

export type SharedTelemetrySnapshot = {
  metrics: SharedMetric[];
  activity: SharedRegionActivity[];
};