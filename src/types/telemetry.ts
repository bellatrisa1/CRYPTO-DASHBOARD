import type { PricePoint } from './market';

export type SystemMetric = {
  label: string;
  value: number;
  unit: '%' | 'MB/s' | 'req/s';
};

export type RegionActivity = {
  region: string;
  value: number;
};

export type TelemetryState = {
  volumeSeries: PricePoint[];
  serverLoadSeries: PricePoint[];
  networkSeries: PricePoint[];
  metrics: SystemMetric[];
  activity: RegionActivity[];
};
