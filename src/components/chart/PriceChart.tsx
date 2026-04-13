import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { PricePoint } from '../../types/market';

type PriceChartProps = {
  data: PricePoint[];
  title?: string;
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PriceChart({ data }: PriceChartProps) {
  const option = useMemo<EChartsOption>(() => {
    return {
      animation: true,
      backgroundColor: 'transparent',
      grid: {
        top: 20,
        right: 20,
        bottom: 32,
        left: 20,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0d1727',
        borderColor: 'rgba(123, 168, 255, 0.24)',
        textStyle: {
          color: '#e9f1ff',
        },
        formatter: (params: unknown) => {
          const items = params as Array<{
            axisValue: string;
            data: number;
          }>;

          if (!items.length) return '';

          const first = items[0];

          return `
            <div style="min-width: 120px;">
              <div style="margin-bottom: 6px; color: #8da3c7;">${first.axisValue}</div>
              <div><strong>Price:</strong> $${first.data.toLocaleString()}</div>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map((item) => formatTime(item.timestamp)),
        axisLine: {
          lineStyle: {
            color: 'rgba(141, 163, 199, 0.2)',
          },
        },
        axisLabel: {
          color: '#8da3c7',
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.06)',
          },
        },
        axisLabel: {
          color: '#8da3c7',
          formatter: (value: number) =>
            `$${Math.round(value).toLocaleString()}`,
        },
      },
      series: [
        {
          name: 'BTC',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: data.map((item) => item.price),
          lineStyle: {
            width: 3,
            color: '#4fa3ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(79, 163, 255, 0.35)' },
                { offset: 1, color: 'rgba(79, 163, 255, 0.02)' },
              ],
            },
          },
        },
      ],
    };
  }, [data]);

  return (
    <ReactECharts
      option={option}
      notMerge
      lazyUpdate
      style={{ width: '100%', height: '320px' }}
    />
  );
}
