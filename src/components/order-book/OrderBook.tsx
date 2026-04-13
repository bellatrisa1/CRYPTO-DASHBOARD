import { useMemo } from 'react';
import { useMarketStore } from '../../store/marketStore';
import type { OrderBookLevel } from '../../types/orderBook';

function formatPrice(price: number) {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getMaxTotal(levels: OrderBookLevel[]) {
  return levels[levels.length - 1]?.total ?? 1;
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
          const depthWidth = Math.max((level.total / maxTotal) * 100, 6);

          return (
            <div
              key={`${side}-${level.price}`}
              className={`order-book-level order-book-level--${side}`}
            >
              <div
                className="order-book-level__depth"
                style={{ width: `${depthWidth}%` }}
              />

              <div className="order-book-level__content">
                <span className="order-book-level__price">{formatPrice(level.price)}</span>
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

      <div className="order-book__grid">
        <DepthRows title="Bids" levels={orderBook.bids} side="bid" />
        <DepthRows title="Asks" levels={orderBook.asks} side="ask" />
      </div>
    </div>
  );
}