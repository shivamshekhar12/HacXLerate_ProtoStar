export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const icon = (name) => `<span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(name)}</span>`;
let timer;
export function announce(message) {
  const status = document.querySelector('#status');
  clearTimeout(timer); status.textContent = message; status.hidden = false;
  timer = setTimeout(() => { status.hidden = true; }, 5000);
}
export function showDialog(title, content) {
  document.querySelector('dialog')?.remove();
  const dialog = document.createElement('dialog');
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${escapeHtml(title)}</h2><button class="icon-button" aria-label="Close dialog" data-close>${icon('close')}</button></div>${content}`;
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  document.body.append(dialog);
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
  dialog.showModal();
  return dialog;
}
