type Metric = {
  label: string;
  value: number;
  unit: '%';
};

type RegionActivity = {
  region: string;
  value: number;
};

type Telemetry = {
  metrics: Metric[];
  activity: RegionActivity[];
};

export function generateTelemetry(): Telemetry {
  return {
    metrics: [
      {
        label: 'CPU',
        value: random(20, 90),
        unit: '%',
      },
      {
        label: 'Memory',
        value: random(30, 85),
        unit: '%',
      },
      {
        label: 'Network',
        value: random(10, 95),
        unit: '%',
      },
    ],
    activity: [
      { region: 'Europe', value: random(40, 100) },
      { region: 'USA', value: random(30, 90) },
      { region: 'Asia', value: random(50, 100) },
      { region: 'LATAM', value: random(10, 70) },
    ],
  };
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}