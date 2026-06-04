import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DEFAULT_LIMIT = 10;

function Analytics() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
  });
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const wsRef = useRef(null);

  useEffect(() => {
    setState({ loading: true, error: null, data: null });

    const ws = new WebSocket('wss://example.com/analytics');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', limit }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'data') {
          setState({ loading: false, error: null, data: message.payload });
        }
      } catch (err) {
        setState((prev) => ({ ...prev, error: err }));
      }
    };

    ws.onerror = (error) => {
      setState((prev) => ({ ...prev, error }));
    };

    ws.onclose = () => {
      // handle close if necessary
    };

    return () => {
      ws.close();
    };
  }, [limit]);

  const data = {
    labels: state.data ? state.data.labels : [],
    datasets: [
      {
        label: 'Values',
        data: state.data ? state.data.values : [],
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <label htmlFor="limit_input">Limit:</label>{' '}
          <input
            id="limit_input"
            type="number"
            min
            = "1"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || DEFAULT_LIMIT)}
            style={{ width: 60 }}
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height: 420 }}>
        {state.loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <span>Loading…</span>
          </div>
        )}
        <Bar data={data} options={options} />
      </div>

      {/* Error */}
      {state.error && (
        <div
          role="alert"
          style={{
            background: '#fff3cd',
            border: '1px solid #ffeeba',
            color: '#856404',
            padding: '8px 12px',
            borderRadius: 6,
          }}
        >
          Could not load live data ({String(state.error)}). Showing sample data.
        </div>
      )}
    </div>
  );
}

export default Analytics;
