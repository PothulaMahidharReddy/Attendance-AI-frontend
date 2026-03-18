import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AutoGraph({ visualization, records }) {
  if (!visualization || !records || records.length === 0) return null;

  const { type, labelField, valueField, title } = visualization;

  const chartData = useMemo(() => {
    // If we have aggregated data from LLM (rare but possible), use it
    if (visualization.data) return visualization.data;

    // Otherwise, aggregate from records
    if (valueField === 'count') {
      const counts = {};
      records.forEach(r => {
        const label = r[labelField] || 'Unknown';
        counts[label] = (counts[label] || 0) + 1;
      });
      return Object.entries(counts).map(([label, value]) => ({ label, value }));
    } else {
      // Direct field mapping (e.g., totalWorkedMinutes per employee)
      // Usually requires sorting or grouping if multiple records per label exist
      const groups = {};
      records.forEach(r => {
        const label = r[labelField] || 'Unknown';
        const val = parseFloat(r[valueField]) || 0;
        groups[label] = (groups[label] || 0) + val;
      });
      return Object.entries(groups)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
    }
  }, [visualization, records]);

  const fieldLabels = {
    userName: 'Employee',
    dateIST: 'Date',
    totalWorkedMinutes: 'Work Minutes',
    overtimeMinutes: 'Overtime Minutes',
    count: 'Count'
  };

  const getLabel = (field) => fieldLabels[field] || field;

  const formatLabel = (val) => {
    if (typeof val === 'string' && val.includes('T')) {
      return val.split('T')[0];
    }
    return val;
  };

  const renderChart = () => {
    const commonXAxisProps = {
      dataKey: "label",
      stroke: "var(--text-dim)",
      fontSize: 10,
      tickLine: false,
      axisLine: false,
      dy: 10,
      tickFormatter: formatLabel,
      label: { 
        value: getLabel(labelField), 
        position: 'insideBottom', 
        offset: -20,
        fill: 'var(--text-muted)',
        fontSize: 12,
        fontWeight: 500
      }
    };

    const commonYAxisProps = {
      stroke: "var(--text-dim)",
      fontSize: 11,
      tickLine: false,
      axisLine: false,
      label: { 
        value: getLabel(valueField), 
        angle: -90, 
        position: 'insideLeft',
        offset: 10,
        fill: 'var(--text-muted)',
        fontSize: 12,
        fontWeight: 500
      }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip 
              contentStyle={{ background: '#1e293b', border: '1px solid var(--border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--primary)' }}
              labelFormatter={formatLabel}
            />
            <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ label }) => formatLabel(label)}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip labelFormatter={formatLabel} />
            <Legend />
          </PieChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: '#1e293b', border: '1px solid var(--border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--primary)' }}
              labelFormatter={formatLabel}
            />
            <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        );
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '2rem',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
      marginBottom: '1rem',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        {title && (
          <h4 style={{ 
            fontSize: '1.1rem', 
            fontWeight: 700, 
            color: 'var(--text)', 
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '2px', background: 'var(--primary)' }} />
            {title}
          </h4>
        )}
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)', 
          marginLeft: '1.25rem',
          fontWeight: 400
        }}>
          Comparing <strong>{getLabel(valueField)}</strong> based on <strong>{getLabel(labelField)}</strong>.
        </p>
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
