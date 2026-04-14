import { useMemo } from 'react';
import { MiniChart } from '../chart/MiniChart';
import { useMarketStore } from '../../store/marketStore';

function formatPrice(price: number) {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatVolume(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

export function MarketOverview() {
  const symbol = useMarketStore((state) => state.symbol);
  const lastPrice = useMarketStore((state) => state.lastPrice);
  const changePercent = useMarketStore((state) => state.changePercent);
  const volume24h = useMarketStore((state) => state.volume24h);
  const telemetry = useMarketStore((state) => state.telemetry);

  const cards = useMemo(
    () => [
      {
        label: symbol.replace('USDT', ' USD'),
        value: formatPrice(lastPrice),
        change: formatPercent(changePercent),
        trend: changePercent >= 0 ? 'up' : 'down',
        chart: telemetry.volumeSeries,
        chartColor: changePercent >= 0 ? '#37e27d' : '#ff5d6c',
      },
      {
        label: '24H Volume',
        value: formatVolume(volume24h),
        change: '+4.12%',
        trend: 'up',
        chart: telemetry.networkSeries,
        chartColor: '#4fa3ff',
      },
      {
        label: 'Active Users',
        value: '12,458',
        change: '+2.11%',
        trend: 'up',
        chart: telemetry.serverLoadSeries,
        chartColor: '#37e27d',
      },
    ],
    [symbol, lastPrice, changePercent, volume24h, telemetry]
  );

  const serverMetric = telemetry.metrics[0]?.value ?? 67;

  return (
    <div className="market-overview">
      {cards.map((card) => (
        <article key={card.label} className="market-card market-card--chart">
          <div className="market-card__top">
            <span className="market-card__label">{card.label}</span>
            <span
              className={`market-card__change ${
                card.trend === 'up' ? 'positive' : 'negative'
              }`}
            >
              {card.change}
            </span>
          </div>

          <div className="market-card__middle">
            <strong className="market-card__value">{card.value}</strong>

            <span
              className={`market-card__arrow ${
                card.trend === 'up'
                  ? 'market-card__arrow--up'
                  : 'market-card__arrow--down'
              }`}
            />
          </div>

          <div className="market-card__chart">
            <MiniChart data={card.chart} color={card.chartColor} />
          </div>
        </article>
      ))}

      <article className="market-card market-card--gauge">
        <div className="market-card__top">
          <span className="market-card__label">Server Health</span>
          <span className="market-card__change positive">+1.02%</span>
        </div>

        <div className="market-card__gauge">
          <div className="market-card__gauge-ring">
            <span>{serverMetric}%</span>
          </div>
        </div>
      </article>
    </div>
  );
}
