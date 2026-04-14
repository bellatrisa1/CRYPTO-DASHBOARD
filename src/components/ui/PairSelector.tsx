import type { ChangeEvent } from 'react';
import type { TradingPair } from '../../types/market';
import { SUPPORTED_PAIRS } from '../../config/market';
import { useMarketStore } from '../../store/marketStore';

const pairOptions: Array<{ value: TradingPair; label: string }> =
  SUPPORTED_PAIRS.map((pair) => ({
    value: pair,
    label: pair.replace('USDT', ' / USDT'),
  }));

export function PairSelector() {
  const symbol = useMarketStore((state) => state.symbol);
  const setSymbol = useMarketStore((state) => state.setSymbol);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSymbol(event.target.value as TradingPair);
  };

  return (
    <label className="pair-selector">
      <span className="pair-selector__label">Pair</span>

      <select
        className="pair-selector__control"
        value={symbol}
        onChange={handleChange}
      >
        {pairOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
