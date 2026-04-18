export type SharedMetricUnit = '%' | 'MB/s' | 'req/s';

export type SharedMetric = {
  label: string;
  value: number;
  unit: SharedMetricUnit;
};

export type SharedRegionActivity = {
  region: string;
  value: number;
};

export type SharedTelemetrySnapshot = {
  metrics: SharedMetric[];
  activity: SharedRegionActivity[];
};