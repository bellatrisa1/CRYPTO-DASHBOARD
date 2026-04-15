import './App.scss';
import { MiniChart } from './components/chart/MiniChart';
import { PriceChart } from './components/chart/PriceChart';
import { OrderBook } from './components/order-book/OrderBook';
import { TradesList } from './components/trades/TradesList';
import { MarketOverview } from './components/ui/MarketOverview';
import { PairSelector } from './components/ui/PairSelector';
import { RegionalActivity } from './components/ui/RegionalActivity';
import { Widget } from './components/ui/Widget';
import { useMarketSnapshot } from './hooks/useMarketSnapshot';
import { useMockMarketStream } from './hooks/useMockMarketStream';
import { useWebSocketStream } from './hooks/useWebSocketStream';
import { buildRealtimeUrl, getRealtimeSource } from './services/streams';
import { useMarketStore } from './store/marketStore';

function App() {
  const symbol = useMarketStore((state) => state.symbol);
  const points = useMarketStore((state) => state.points);
  const isConnected = useMarketStore((state) => state.isConnected);
  const streamStatus = useMarketStore((state) => state.streamStatus);
  const reconnectAttempt = useMarketStore((state) => state.reconnectAttempt);
  const nextReconnectInMs = useMarketStore((state) => state.nextReconnectInMs);
  const telemetry = useMarketStore((state) => state.telemetry);
  const latencyMs = useMarketStore((state) => state.latencyMs);

  const realtimeSource = getRealtimeSource();
  const realtimeUrl = buildRealtimeUrl(symbol);

  useMarketSnapshot({
    symbol,
    enabled: true,
  });

  useWebSocketStream({
    enabled: realtimeSource !== 'mock' && Boolean(realtimeUrl),
    url: realtimeUrl ?? '',
    symbol,
  });

  useMockMarketStream({
    enabled: realtimeSource === 'mock',
  });

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

              {latencyMs !== null ? (
                <span className="stream-badge stream-badge--latency">
                  {latencyMs} ms
                </span>
              ) : null}

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
              <PriceChart data={points} streamStatus={streamStatus} />
            </Widget>
          </section>

          <section className="dashboard-grid__server-load">
            <Widget title="Server Load" subtitle="Last 30 updates">
              <MiniChart data={telemetry.serverLoadSeries} color="#f3bc58" />
            </Widget>
          </section>

          <section className="dashboard-grid__network">
            <Widget title="Network Traffic" subtitle="Realtime throughput">
              <MiniChart data={telemetry.networkSeries} color="#37e27d" />
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
              <MiniChart data={telemetry.volumeSeries} color="#4fa3ff" />
            </Widget>
          </section>

          <section className="dashboard-grid__activity">
            <Widget title="User Activity" subtitle="Regional events">
              <RegionalActivity />
            </Widget>
          </section>

          <section className="dashboard-grid__metrics">
            <Widget title="Server Metrics" subtitle="System health">
              <div className="gauge-list">
                {telemetry.metrics.map((metric) => (
                  <div key={metric.label} className="gauge-card">
                    <div className="gauge-ring">
                      {metric.value}
                      {metric.unit}
                    </div>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </Widget>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
