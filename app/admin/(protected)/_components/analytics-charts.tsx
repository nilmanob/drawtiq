"use client";

import { useMemo, useState } from "react";
import type { AnalyticsSeriesPoint } from "@/lib/analytics/types";
import { formatCount } from "@/lib/analytics/format";

type Metric = "pageviews" | "sessions" | "visitors";

const METRICS: Array<{ key: Metric; label: string }> = [
  { key: "pageviews", label: "Page views" },
  { key: "sessions", label: "Sessions" },
  { key: "visitors", label: "Visitors" },
];

export function AnalyticsTrendChart({
  series,
  rangeLabel,
}: {
  series: AnalyticsSeriesPoint[];
  rangeLabel: string;
}) {
  const [metric, setMetric] = useState<Metric>("pageviews");
  const max = useMemo(
    () => Math.max(1, ...series.map((point) => point[metric])),
    [metric, series]
  );
  const total = useMemo(
    () => series.reduce((sum, point) => sum + point[metric], 0),
    [metric, series]
  );
  const hasData = total > 0;
  const width = 760;
  const height = 230;
  const padding = { top: 20, right: 18, bottom: 34, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const gap = series.length > 31 ? 2 : 6;
  const barWidth = Math.max(
    2,
    (plotWidth - gap * Math.max(0, series.length - 1)) / Math.max(1, series.length)
  );
  const labelEvery = Math.max(1, Math.ceil(series.length / 8));

  return (
    <div className="admin-chart-panel">
      <div className="admin-chart-head">
        <div>
          <p className="admin-kicker">Trend / {rangeLabel}</p>
          <h2>
            {metric === "visitors"
              ? "Visitors per period"
              : `${formatCount(total)} ${METRICS.find(
                  (item) => item.key === metric
                )?.label.toLowerCase()}`}
          </h2>
        </div>
        <div className="admin-chart-controls" role="group" aria-label="Chart metric">
          {METRICS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={metric === item.key}
              className={`admin-chart-toggle${metric === item.key ? " is-active" : ""}`}
              onClick={() => setMetric(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {hasData ? (
        <div className="admin-chart-scroll">
          <svg
            className="admin-chart"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${METRICS.find((item) => item.key === metric)?.label} trend for ${rangeLabel}`}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
              const y = padding.top + plotHeight - plotHeight * fraction;
              return (
                <g key={fraction}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={y}
                    y2={y}
                    className="admin-chart-gridline"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="admin-chart-axis"
                  >
                    {formatCount(Math.round(max * fraction))}
                  </text>
                </g>
              );
            })}

            {series.map((point, index) => {
              const value = point[metric];
              const barHeight = (value / max) * plotHeight;
              const x = padding.left + index * (barWidth + gap);
              const y = padding.top + plotHeight - barHeight;

              return (
                <g key={point.bucket}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(value > 0 ? 1 : 0, barHeight)}
                    rx={1.5}
                    className="admin-chart-bar"
                  >
                    {/* One string child: React cannot hydrate a <title> split
                        into several text nodes. */}
                    <title>{`${point.label}: ${formatCount(value)}`}</title>
                  </rect>
                  {index % labelEvery === 0 || index === series.length - 1 ? (
                    <text
                      x={x + barWidth / 2}
                      y={height - 12}
                      textAnchor="middle"
                      className="admin-chart-axis"
                    >
                      {point.label.replace(/^Week of /, "")}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="admin-chart-empty">
          No {METRICS.find((item) => item.key === metric)?.label.toLowerCase()} recorded
          in this period.
        </div>
      )}
    </div>
  );
}
