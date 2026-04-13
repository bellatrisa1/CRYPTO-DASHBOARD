import './App.scss';
import { PriceChart } from './components/chart/PriceChart';
import { OrderBook } from './components/order-book/OrderBook';
import { TradesList } from './components/trades/TradesList';
import { MarketOverview } from './components/ui/MarketOverview';
import { PairSelector } from './components/ui/PairSelector';
import { Widget } from './components/ui/Widget';
import { useWebSocketStream } from './hooks/useWebSocketStream';
import { useMarketStore } from './store/marketStore';

function App() {
  const symbol = useMarketStore((state) => state.symbol);

  useWebSocketStream({
    enabled: true,
    url: `wss://stream.binance.com:9443/stream?streams=${symbol.toLowerCase()}@aggTrade/${symbol.toLowerCase()}@depth20@100ms`,
  });

  const points = useMarketStore((state) => state.points);
  const isConnected = useMarketStore((state) => state.isConnected);
  const streamStatus = useMarketStore((state) => state.streamStatus);
  const reconnectAttempt = useMarketStore((state) => state.reconnectAttempt);
  const nextReconnectInMs = useMarketStore((state) => state.nextReconnectInMs);

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-header__eyebrow">Real-time monitoring</p>
            <h1 className="dashboard-header__title">PulseGrid Dashboard</h1>
          </div>

          <div className="dashboard-header__controls">
            <PairSelector />

            <div className="dashboard-header__status">
              <span
                className={`status-dot ${
                  isConnected ? 'status-dot--live' : 'status-dot--offline'
                }`}
              />
              <span>{isConnected ? 'Stream connected' : 'Stream offline'}</span>
              <span className="stream-badge">{streamStatus}</span>

              {streamStatus === 'reconnecting' && nextReconnectInMs !== null ? (
                <span className="stream-badge stream-badge--warning">
                  retry #{reconnectAttempt} in{' '}
                  {(nextReconnectInMs / 1000).toFixed(1)}s
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <main className="dashboard-grid">
          <section className="dashboard-grid__top">
            <MarketOverview />
          </section>

          <section className="dashboard-grid__main-chart">
            <Widget
              title={`${symbol.replace('USDT', '/USDT')} Price Chart`}
              subtitle="Live market overview"
            >
              <PriceChart data={points} />
            </Widget>
          </section>

          <section className="dashboard-grid__server-load">
            <Widget title="Server Load" subtitle="Last 30 minutes">
              <div className="chart-placeholder">
                <span>Mini chart</span>
              </div>
            </Widget>
          </section>

          <section className="dashboard-grid__network">
            <Widget title="Network Traffic" subtitle="Realtime throughput">
              <div className="chart-placeholder">
                <span>Traffic chart</span>
              </div>
            </Widget>
          </section>

          <section className="dashboard-grid__order-book">
            <Widget
              title="Order Book"
              subtitle={`${symbol.replace('USDT', '/USDT')} · top 20 levels`}
            >
              <OrderBook />
            </Widget>
          </section>

          <section className="dashboard-grid__trades">
            <Widget title="Recent Trades" subtitle="Live trade feed">
              <TradesList />
            </Widget>
          </section>

          <section className="dashboard-grid__volume">
            <Widget
              title="Trading Volume"
              subtitle="Aggregated market activity"
            >
              <div className="chart-placeholder">
                <span>Volume widget</span>
              </div>
            </Widget>
          </section>

          <section className="dashboard-grid__activity">
            <Widget title="User Activity" subtitle="Regional events">
              <div className="map-placeholder">
                <span>World activity map</span>
              </div>
            </Widget>
          </section>

          <section className="dashboard-grid__metrics">
            <Widget title="Server Metrics" subtitle="System health">
              <div className="gauge-list">
                <div className="gauge-card">
                  <div className="gauge-ring">59%</div>
                  <span>Memory</span>
                </div>
                <div className="gauge-card">
                  <div className="gauge-ring">72%</div>
                  <span>CPU</span>
                </div>
                <div className="gauge-card">
                  <div className="gauge-ring">48%</div>
                  <span>Network</span>
                </div>
              </div>
            </Widget>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
