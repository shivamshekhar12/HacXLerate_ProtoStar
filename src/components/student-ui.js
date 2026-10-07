import { escapeHtml, icon } from './ui.js';
export function demoBanner(state) {
  if(state?.mode==='live')return `<div class="demo-banner">${icon('cloud_done')}<span><strong>Your Supabase account</strong> · Self-reported portfolio. Institutional records appear only when supplied.</span></div>`;
  return `<div class="demo-banner">${icon('science')}<span><strong>Frontend preview</strong> · Sample data. Edits stay in this browser.</span><button class="text-button" data-action="sources">View data sources ${icon('arrow_forward')}</button></div>`;
}
export function pageHeading(eyebrow, title, description, action = '') {
  return `<div class="page-heading"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${action}</div>`;
}
export function renderExploreCards() {
  const cards = [
    ['growth','trending_up','My Growth','Track trends and turn your next action into a weekly goal.','View progress'],
    ['skills','explore','Skills & Target Role','Compare your skill evidence with a sample target role.','Explore skills'],
    ['simulator','tune','What-If Simulator','Try hypothetical changes without altering your records.','Try a scenario'],
    ['profile','verified_user','Profile & Consent','Manage your profile and preview sharing preferences.','Manage profile'],
  ];
  return `<section class="explore-section"><div class="section-heading"><div><h2>Next Steps & Portal Exploration</h2><p>Your workspace, one focused next step at a time.</p></div></div><div class="explore-grid">${cards.map(([route, symbol, title, body, cta]) => `<a href="#/${route}" class="panel explore-card"><span class="explore-icon">${icon(symbol)}</span><h3>${title}</h3><p>${body}</p><span class="text-button">${cta}${icon('arrow_forward')}</span></a>`).join('')}</div></section>`;
}
