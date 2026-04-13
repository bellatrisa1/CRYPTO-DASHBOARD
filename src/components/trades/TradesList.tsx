import { useMemo } from 'react';
import { useMarketStore } from '../../store/marketStore';
import type { Trade } from '../../types/trade';

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

function getTradeRowClassName(side: Trade['side']) {
  return side === 'buy'
    ? 'trade-row trade-row--buy'
    : 'trade-row trade-row--sell';
}

export function TradesList() {
  const trades = useMarketStore((state) => state.trades);

  const visibleTrades = useMemo(() => trades.slice(0, 12), [trades]);

  return (
    <div className="trades-placeholder">
      <div className="trades-placeholder__head">
        <span>Time</span>
        <span>Pair</span>
        <span>Price</span>
        <span>Amount</span>
      </div>

      <div className="trades-placeholder__body">
        {visibleTrades.map((trade) => (
          <div key={trade.id} className={getTradeRowClassName(trade.side)}>
            <span>{formatTime(trade.timestamp)}</span>
            <span>{trade.symbol}</span>
            <span className={trade.side === 'buy' ? 'positive' : 'negative'}>
              {formatPrice(trade.price)}
            </span>
            <span>{trade.amount.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
