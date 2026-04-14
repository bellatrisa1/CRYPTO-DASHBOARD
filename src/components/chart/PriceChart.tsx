import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { PricePoint } from '../../types/market';
import type { StreamStatus } from '../../types/ws';
import { WidgetState } from '../ui/WidgetState';

type PriceChartProps = {
  data: PricePoint[];
  streamStatus?: StreamStatus;
};

type CandleItem = {
  time: string;
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildCandles(points: PricePoint[]): CandleItem[] {
  if (points.length === 0) return [];

  return points.map((point, index) => {
    const prev = points[index - 1];
    const next = points[index + 1];

    const open = prev?.price ?? point.price;
    const close = point.price;

    const localLow = Math.min(
      open,
      close,
      prev?.price ?? close,
      next?.price ?? close
    );

    const localHigh = Math.max(
      open,
      close,
      prev?.price ?? close,
      next?.price ?? close
    );

    const extraSpread = Math.max(point.price * 0.0015, 8);

    const low = Number((localLow - extraSpread * 0.25).toFixed(2));
    const high = Number((localHigh + extraSpread * 0.25).toFixed(2));

    return {
      time: formatTime(point.timestamp),
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      low,
      high,
      volume: Number(point.volume.toFixed(2)),
    };
  });
}

export function PriceChart({ data, streamStatus = 'idle' }: PriceChartProps) {
  const candles = useMemo(() => buildCandles(data), [data]);

  const option = useMemo<EChartsOption>(() => {
    const categoryData = candles.map((item) => item.time);
    const candlestickData = candles.map((item) => [
      item.open,
      item.close,
      item.low,
      item.high,
    ]);
    const volumeData = candles.map((item) => item.volume);

    return {
      animation: true,
      backgroundColor: 'transparent',
      legend: {
        show: false,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        backgroundColor: '#0d1727',
        borderColor: 'rgba(123, 168, 255, 0.24)',
        textStyle: {
          color: '#e9f1ff',
        },
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
        label: {
          backgroundColor: '#1b2a41',
        },
      },
      grid: [
        {
          left: 18,
          right: 18,
          top: 18,
          height: '66%',
        },
        {
          left: 18,
          right: 18,
          top: '78%',
          height: '14%',
        },
      ],
      xAxis: [
        {
          type: 'category',
          data: categoryData,
          boundaryGap: true,
          axisLine: {
            lineStyle: {
              color: 'rgba(141, 163, 199, 0.2)',
            },
          },
          axisLabel: {
            color: '#8da3c7',
            fontSize: 11,
          },
          splitLine: {
            show: false,
          },
          min: 'dataMin',
          max: 'dataMax',
        },
        {
          type: 'category',
          gridIndex: 1,
          data: categoryData,
          boundaryGap: true,
          axisLine: {
            lineStyle: {
              color: 'rgba(141, 163, 199, 0.2)',
            },
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          min: 'dataMin',
          max: 'dataMax',
        },
      ],
      yAxis: [
        {
          scale: true,
          splitNumber: 5,
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: '#8da3c7',
            formatter: (value: number) =>
              `$${Math.round(value).toLocaleString()}`,
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.06)',
            },
          },
        },
        {
          gridIndex: 1,
          splitNumber: 2,
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: '#8da3c7',
            fontSize: 10,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Price',
          type: 'candlestick',
          data: candlestickData,
          itemStyle: {
            color: '#37e27d',
            color0: '#ff5d6c',
            borderColor: '#37e27d',
            borderColor0: '#ff5d6c',
          },
          emphasis: {
            itemStyle: {
              borderWidth: 1,
            },
          },
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumeData,
          barMaxWidth: 10,
          itemStyle: {
            color: 'rgba(79, 163, 255, 0.65)',
          },
        },
      ],
    };
  }, [candles]);

  if (streamStatus === 'error') {
    return (
      <WidgetState
        title="Chart unavailable due to stream error"
        variant="error"
      />
    );
  }

  if (
    (streamStatus === 'connecting' || streamStatus === 'reconnecting') &&
    data.length === 0
  ) {
    return <WidgetState title="Waiting for market data..." variant="warning" />;
  }

  if (data.length === 0) {
    return <WidgetState title="No chart data yet" />;
  }

  return (
    <ReactECharts
      option={option}
      notMerge
      lazyUpdate
      style={{ width: '100%', height: '360px' }}
    />
  );
}
