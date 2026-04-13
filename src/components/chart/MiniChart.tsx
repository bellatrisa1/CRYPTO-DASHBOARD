import ReactECharts from 'echarts-for-react';
import type { PricePoint } from '../../types/market';

type MiniChartProps = {
  data: PricePoint[];
  color: string;
};

export function MiniChart({ data, color }: MiniChartProps) {
  const option = {
    grid: {
      top: 10,
      bottom: 10,
      left: 0,
      right: 0,
    },
    xAxis: {
      type: 'category',
      show: false,
      data: data.map((p) => p.timestamp),
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        type: 'line',
        data: data.map((p) => p.price),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color,
        },
        areaStyle: {
          opacity: 0.1,
          color,
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 120 }} />;
}
