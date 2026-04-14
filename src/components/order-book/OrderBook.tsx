import { useMemo, useState } from 'react';
import { useMarketStore } from '../../store/marketStore';
import type { OrderBookLevel } from '../../types/orderBook';
import { WidgetState } from '../ui/WidgetState';

function formatPrice(price: number) {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getMaxTotal(levels: OrderBookLevel[]) {
  if (!levels.length) return 1;
  return levels[levels.length - 1]?.total || 1;
}

function DepthRows({
  title,
  levels,
  side,
}: {
  title: string;
  levels: OrderBookLevel[];
  side: 'bid' | 'ask';
}) {
  const maxTotal = useMemo(() => getMaxTotal(levels), [levels]);

  return (
    <div className={`order-book-panel order-book-panel--${side}`}>
      <div className="order-book-panel__header">
        <h3>{title}</h3>
        <div className="order-book-columns">
          <span>Price</span>
          <span>Amount</span>
          <span>Total</span>
        </div>
      </div>

      <div className="order-book-panel__body">
        {levels.map((level) => {
          const percent = maxTotal > 0 ? (level.total / maxTotal) * 100 : 0;
          const depthWidth = Math.max(percent, 6);

          return (
            <div
              key={`${side}-${level.price}`}
              className={`order-book-level order-book-level--${side}`}
            >
              <div
                className="order-book-level__depth"
                style={{
                  width: `${depthWidth}%`,
                  opacity: Math.min(0.14 + percent / 140, 0.45),
                }}
              />

              <div className="order-book-level__content">
                <span className="order-book-level__price">
                  {formatPrice(level.price)}
                </span>
                <span>{level.amount.toFixed(3)}</span>
                <span>{level.total.toFixed(3)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderBook() {
  const orderBook = useMarketStore((state) => state.orderBook);
  const streamStatus = useMarketStore((state) => state.streamStatus);

  const [depth, setDepth] = useState(12);

  const bids = useMemo(
    () => orderBook.bids.slice(0, depth),
    [orderBook.bids, depth]
  );

  const asks = useMemo(
    () => orderBook.asks.slice(0, depth),
    [orderBook.asks, depth]
  );

  const hasLevels = bids.length > 0 || asks.length > 0;

  if (streamStatus === 'error') {
    return (
      <WidgetState
        title="Order book unavailable due to stream error"
        variant="error"
      />
    );
  }

  if (
    (streamStatus === 'connecting' || streamStatus === 'reconnecting') &&
    !hasLevels
  ) {
    return (
      <WidgetState title="Waiting for depth snapshot..." variant="warning" />
    );
  }

  if (!hasLevels) {
    return <WidgetState title="No order book data yet" />;
  }

  return (
    <div className="order-book">
      <div className="order-book__spread">
        <div className="order-book-spread-card">
          <span className="order-book-spread-card__label">Spread</span>
          <strong>{orderBook.spread.toFixed(2)}</strong>
        </div>

        <div className="order-book-spread-card">
          <span className="order-book-spread-card__label">Spread %</span>
          <strong>{orderBook.spreadPercent.toFixed(4)}%</strong>
        </div>
      </div>

      <div className="order-book__controls">
        <span>Depth</span>
        <select
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="order-book__grid">
        <DepthRows title="Bids" levels={bids} side="bid" />
        <DepthRows title="Asks" levels={asks} side="ask" />
      </div>
    </div>
  );
}
