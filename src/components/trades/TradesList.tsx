import { useMemo, useState } from 'react';
import { useMarketStore } from '../../store/marketStore';
import { WidgetState } from '../ui/WidgetState';

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatPrice(price: number) {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type Filter = 'all' | 'buy' | 'sell';

export function TradesList() {
  const trades = useMarketStore((state) => state.trades);
  const streamStatus = useMarketStore((state) => state.streamStatus);

  const [limit, setLimit] = useState(12);
  const [filter, setFilter] = useState<Filter>('all');

  const visibleTrades = useMemo(() => {
    let result = trades;

    if (filter !== 'all') {
      result = result.filter((t) => t.side === filter);
    }

    return result.slice(0, limit);
  }, [trades, filter, limit]);

  const maxVolume = useMemo(() => {
    if (!visibleTrades.length) return 1;
    return Math.max(...visibleTrades.map((t) => t.amount), 1);
  }, [visibleTrades]);

  if (streamStatus === 'error') {
    return (
      <WidgetState
        title="Trades unavailable due to stream error"
        variant="error"
      />
    );
  }

  if (!trades.length) {
    return <WidgetState title="No trades yet" />;
  }

  if (!visibleTrades.length) {
    return <WidgetState title="No trades for selected filter" />;
  }

  return (
    <div className="trades">
      <div className="trades__controls">
        <div className="trades__filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
            type="button"
          >
            All
          </button>
          <button
            className={filter === 'buy' ? 'active' : ''}
            onClick={() => setFilter('buy')}
            type="button"
          >
            Buy
          </button>
          <button
            className={filter === 'sell' ? 'active' : ''}
            onClick={() => setFilter('sell')}
            type="button"
          >
            Sell
          </button>
        </div>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="trades-placeholder__head">
        <span>Time</span>
        <span>Pair</span>
        <span>Price</span>
        <span>Amount</span>
      </div>

      <div className="trades-placeholder__body">
        {visibleTrades.map((trade, index) => {
          const percent = (trade.amount / maxVolume) * 100;
          const isNewest = index === 0;

          return (
            <div
              key={trade.id}
              className={`trade-row ${
                trade.side === 'buy'
                  ? 'trade-row--buy'
                  : 'trade-row--sell'
              } ${isNewest ? 'trade-row--flash' : ''}`}
            >
              <div className="trade-row__volume-bar">
                <div
                  className="trade-row__volume-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span>{formatTime(trade.timestamp)}</span>
              <span>{trade.symbol}</span>
              <span
                className={`trade-row__price ${
                  trade.side === 'buy' ? 'positive' : 'negative'
                } ${isNewest ? 'trade-row__price--flash' : ''}`}
              >
                {formatPrice(trade.price)}
              </span>
              <span>{trade.amount.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}