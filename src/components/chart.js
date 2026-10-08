import { escapeHtml, icon } from './ui.js';
const metrics = {
  academic: { label: 'CGPA', max: 10, unit: '/ 10' },
  attendance: { label: 'Attendance', max: 100, unit: '%' },
  coding: { label: 'Coding assessment', max: 100, unit: '/ 100' },
};
export function renderTrend(metric = 'academic', history = []) {
  const config = metrics[metric] ?? metrics.academic;
  const key = metrics[metric] ? metric : 'academic';
  if(!history.length)return '<div class="empty-state"><h3>No progress history yet</h3><p>Your recorded measurements will appear here. No history is invented for a new account.</p></div>';
  const recorded=history.filter(row=>typeof row[key]==='number'&&Number.isFinite(row[key])&&row[key]>=0&&row[key]<=config.max);
  if(!recorded.length)return '<div class="empty-state"><h3>No recorded measurements for this metric</h3><p>Missing or invalid measurements are not plotted as zero.</p></div>';
  const points = recorded.map((row, i) => ({ x: 48 + i * (recorded.length>1?392/(recorded.length-1):0), y: 172 - row[key] / config.max * 136, value: row[key], label: row.period }));
  const line = points.map(p => `${p.x},${p.y}`).join(' ');
  return `<figure class="trend-figure"><svg viewBox="0 0 488 212" class="trend-chart" role="img" aria-label="${config.label} trend: ${points.map(p => `${escapeHtml(p.label)}: ${p.value}${config.unit}`).join(', ')}">
    ${[0, .5, 1].map(f => `<line x1="48" y1="${172-f*136}" x2="440" y2="${172-f*136}" class="chart-grid"/><text x="8" y="${176-f*136}" class="chart-axis">${config.max*f}</text>`).join('')}
    <polygon points="48,172 ${line} 440,172" class="chart-area"/><polyline points="${line}" class="chart-line"/>
    ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="5" class="chart-point"/><text x="${p.x}" y="${p.y-14}" text-anchor="middle" class="chart-value">${p.value}</text><text x="${p.x}" y="200" text-anchor="middle" class="chart-axis">${escapeHtml(p.label)}</text>`).join('')}
    </svg><figcaption>${escapeHtml(config.label)} in original units (${config.unit}). Recorded history.</figcaption></figure>`;
}
export function renderTrendCard(state, showDetails = true) {
  return `<section class="panel momentum-card"><div class="section-heading"><div><p class="eyebrow">SEMESTER PROGRESS</p><h2>Growth Momentum</h2></div><span class="badge neutral">Recorded history</span></div><div class="segmented" role="group" aria-label="Chart metric">${Object.entries(metrics).map(([key, c]) => `<button data-chart="${key}" aria-pressed="${state.ui.chartMetric === key}">${c.label}</button>`).join('')}</div>${renderTrend(state.ui.chartMetric,state.history)}<div class="chart-footer"><span>${icon('insights')}Explore the recorded trend</span>${showDetails ? `<a class="text-button" href="#/growth">Detailed progress ${icon('arrow_forward')}</a>` : '<span>Recorded measurements</span>'}</div></section>`;
}
