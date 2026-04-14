import { useMarketStore } from '../../store/marketStore';

export function RegionalActivity() {
  const activity = useMarketStore((state) => state.telemetry.activity);

  return (
    <div className="regional-activity">
      {activity.map((item) => (
        <div key={item.region} className="regional-activity__row">
          <div className="regional-activity__meta">
            <span className="regional-activity__region">{item.region}</span>
            <span className="regional-activity__value">{item.value}%</span>
          </div>

          <div className="regional-activity__bar">
            <div
              className="regional-activity__fill"
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
