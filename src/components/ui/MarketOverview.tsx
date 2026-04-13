const cards = [
  {
    label: 'BTC USD',
    value: '48,732.15',
    change: '+2.85%',
    trend: 'up',
  },
  {
    label: 'ETH USD',
    value: '3,210.45',
    change: '-1.24%',
    trend: 'down',
  },
  {
    label: 'Active Users',
    value: '12,458',
    change: '+4.12%',
    trend: 'up',
  },
  {
    label: 'Server Health',
    value: '67%',
    change: '+1.02%',
    trend: 'up',
  },
];

export function MarketOverview() {
  return (
    <div className="market-overview">
      {cards.map((card) => (
        <article key={card.label} className="market-card">
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

          <div className="market-card__bottom">
            <strong className="market-card__value">{card.value}</strong>
            <span
              className={`market-card__trend ${
                card.trend === 'up' ? 'market-card__trend--up' : 'market-card__trend--down'
              }`}
            />
          </div>
        </article>
      ))}
    </div>
  );
}