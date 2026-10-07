import { icon,escapeHtml as e } from './ui.js';
export const frontendBanner=()=>`<div class="demo-banner">${icon('science')}<span><strong>Role preview</strong> · Synthetic data and local drafts. No authenticated access or live messaging.</span></div>`;
export const metricCards=(items)=>`<div class="metric-grid">${items.map(([name,value,description,symbol])=>`<section class="panel metric-card"><div class="section-heading"><span class="eyebrow">${name}</span>${icon(symbol)}</div><strong>${value}</strong><p>${description}</p></section>`).join('')}</div>`;
export const emptyState=(title,body,action='')=>`<div class="empty-state">${icon('inbox')}<h3>${e(title)}</h3><p>${e(body)}</p>${action}</div>`;
export const searchInput=(id,label,value)=>`<div class="search-field">${icon('search')}<label class="sr-only" for="${id}">${label}</label><input id="${id}" type="search" placeholder="${label}…" value="${e(value)}"/></div>`;
export const initials=(name)=>e(name.split(/\s+/).map(x=>x[0]).slice(0,2).join(''));
