// src/components/RadarChart.jsx
export default function RadarChart({ candidate, benchmark, size = 260 }) {
  const labels = ['Relevance', 'Depth', 'Clarity', 'Correctness']
  const n = labels.length
  const cx = size / 2, cy = size / 2, r = size * 0.32

  const angle = i => (i / n) * Math.PI * 2 - Math.PI / 2

  const pt = (val, i) => {
    const a = angle(i)
    return { x: cx + Math.cos(a) * r * val, y: cy + Math.sin(a) * r * val }
  }

  const gridPoly = (scale) =>
    labels.map((_, i) => {
      const a = angle(i)
      return `${cx + Math.cos(a) * r * scale},${cy + Math.sin(a) * r * scale}`
    }).join(' ')

  const toPoly = (vals) => vals.map((v, i) => pt(v / 100, i)).map(p => `${p.x},${p.y}`).join(' ')

  const cVals = labels.map(l => candidate[l.toLowerCase()] || 0)
  const bVals = labels.map(l => benchmark[l.toLowerCase()] || 70)

  const labelPos = labels.map((_, i) => {
    const a = angle(i)
    const dist = r + size * 0.14
    return {
      x: cx + Math.cos(a) * dist,
      y: cy + Math.sin(a) * dist,
      anchor: Math.abs(Math.cos(a)) < 0.15 ? 'middle' : Math.cos(a) < 0 ? 'end' : 'start'
    }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((scale, i) => (
        <polygon key={i} points={gridPoly(scale)} fill="none"
          stroke={scale === 1 ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.06)'}
          strokeWidth={scale === 1 ? 1 : 0.5} />
      ))}
      {/* Axis lines */}
      {labels.map((_, i) => {
        const a = angle(i)
        return <line key={i}
          x1={cx} y1={cy}
          x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r}
          stroke="rgba(0,0,0,.08)" strokeWidth={0.5} />
      })}
      {/* Benchmark polygon */}
      <polygon points={toPoly(bVals)}
        fill="rgba(79,110,247,.1)" stroke="rgba(79,110,247,.35)"
        strokeWidth={1.5} strokeDasharray="5 3" />
      {/* Candidate polygon */}
      <polygon points={toPoly(cVals)}
        fill="rgba(79,110,247,.22)" stroke="#4F6EF7" strokeWidth={2} />
      {/* Candidate dots */}
      {cVals.map((v, i) => {
        const p = pt(v / 100, i)
        return <circle key={i} cx={p.x} cy={p.y} r={4}
          fill="#4F6EF7" stroke="#fff" strokeWidth={1.5} />
      })}
      {/* Labels */}
      {labels.map((label, i) => (
        <text key={i}
          x={labelPos[i].x} y={labelPos[i].y}
          textAnchor={labelPos[i].anchor}
          dominantBaseline="central"
          style={{ fontSize: 11, fill: 'var(--c-ink-3)', fontFamily: 'var(--font-body)', fontWeight: 500 }}
        >{label}</text>
      ))}
      {/* Score labels at dots */}
      {cVals.map((v, i) => {
        const p = pt(v / 100, i)
        return (
          <text key={i} x={p.x} y={p.y - 8}
            textAnchor="middle"
            style={{ fontSize: 10, fill: '#4F6EF7', fontFamily: 'var(--font-mono)', fontWeight: 500 }}
          >{v}%</text>
        )
      })}
    </svg>
  )
}
