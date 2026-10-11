import { icon } from './icons.js';
import { renderStandardOverview, bindStandardOverview } from './overview.js';
import { renderSpecialOverview, bindSpecialOverview } from './overview-special.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const i = (name, size = 18) => icon(name, size);
const label = (text) => `<span class="specimen-label">${text}</span>`;
const button = (text, extra = '') => `<button class="p-button" ${extra}>${text}</button>`;
const avatar = (initials, extra = '') => `<span class="p-avatar ${extra}">${initials}</span>`;
const tile = (name, content, extra = '') => `<section class="specimen ${extra}" data-specimen="${escape(name.toLowerCase())}">${content}</section>`;

function componentGallery(filter) {
  const examples = [
    ['Accordion', `<div class="p-accordion"><details open><summary>What is a design token?</summary><p>A small, reusable decision that brings a whole interface together.</p></details><details><summary>Can I use my own colors?</summary><p>Absolutely. Choose a brand color in the editor and see every component respond.</p></details><details><summary>How do I export my theme?</summary><p>Use Export to copy your theme as CSS variables or download a JSON file.</p></details></div>`],
    ['Alert', `<div class="p-alert">${i('check', 18)}<div><strong>You're all set</strong><p>Your project has been saved. Keep making good things.</p></div></div>`],
    ['Autocomplete', `<label class="p-field">Find a font<input class="p-input" list="font-suggestions" placeholder="Start typing a font…"></label><datalist id="font-suggestions"><option>Inter</option><option>Geist</option><option>DM Sans</option><option>Manrope</option><option>Space Grotesk</option><option>Plus Jakarta Sans</option></datalist><p class="p-muted p-small">A good typeface changes everything.</p>`],
    ['Avatar', `<div class="avatar-showcase">${avatar('JL', 'avatar-large')}${avatar('AL', 'avatar-purple')}${avatar('MJ', 'avatar-gold')}${avatar('KT')}</div><div class="p-avatar-group">${avatar('JL')}${avatar('AL', 'avatar-purple')}${avatar('MJ', 'avatar-gold')}<span class="p-avatar">+4</span><span class="p-small p-muted">Great company.</span></div>`],
    ['Badge', `<div class="p-tags"><span class="p-tag">${i('check', 12)} Published</span><span class="p-tag p-tag-neutral">Draft</span><span class="p-tag p-tag-outline">New</span><span class="p-tag">Pro</span></div>`],
    ['Button', `<div class="component-button-stack">${button('Primary action', 'data-action="component-primary"')}<button class="p-button p-button-secondary" data-action="component-secondary">Secondary action</button><button class="p-text-button" data-action="component-text">Just a text button ${i('arrowRight', 15)}</button><button class="p-button" disabled>Not available yet</button></div>`],
    ['Checkbox', `<label class="p-check"><input type="checkbox" checked> Send me the good stuff</label><label class="p-check"><input type="checkbox"> A little inspiration, occasionally</label><label class="p-check is-disabled"><input type="checkbox" disabled> This option is unavailable</label>`],
    ['Checkbox group', `<fieldset class="p-fieldset"><legend>What are you working on?</legend><label class="p-check"><input type="checkbox" checked value="web"> A website</label><label class="p-check"><input type="checkbox" value="app"> An app</label><label class="p-check"><input type="checkbox" value="system"> A design system</label></fieldset>`],
    ['Collapsible', `<details class="p-collapsible"><summary>${i('folder', 17)} My saved projects <span>3</span>${i('chevronDown', 15)}</summary><div class="p-file">${i('file', 15)} Weekend experiments</div><div class="p-file">${i('file', 15)} Something for a friend</div><div class="p-file">${i('file', 15)} The next big idea</div></details>`],
    ['Dialog', `<p class="p-small p-muted">A moment to focus on what matters.</p>${button('Open dialog', 'data-action="open-dialog"')}`],
    ['Input', `<label class="p-field">Your name<input class="p-input" placeholder="Jamie Lee"></label><label class="p-field">Email address<div class="p-input-icon">${i('mail', 16)}<input class="p-input" type="email" placeholder="jamie@example.com"></div></label>`],
    ['Menu', `<div class="p-menu-wrap"><button class="p-button p-button-secondary" data-action="toggle-menu" aria-expanded="false">Project options ${i('chevronDown', 15)}</button><div class="p-menu" hidden><button data-menu-choice="Edit project">${i('pen', 16)} Edit project</button><button data-menu-choice="Duplicate project">${i('copy', 16)} Duplicate</button><button data-menu-choice="Archive project">${i('folder', 16)} Archive project</button></div></div>`],
    ['Number field', `<label class="p-field">How many seats?<div class="p-number-field"><button type="button" data-step="-1" aria-label="Remove a seat">${i('minus', 15)}</button><input type="number" min="1" max="99" value="5" aria-label="Number of seats"><button type="button" data-step="1" aria-label="Add a seat">${i('plus', 15)}</button></div></label><p class="p-small p-muted">There's always room for one more.</p>`],
    ['Popover', `<div class="p-menu-wrap"><button class="p-button p-button-secondary" data-action="toggle-popover" aria-expanded="false">A little more context ${i('plus', 15)}</button><div class="p-popover" hidden><strong>The small details.</strong><p>This theme uses your choices for every color, corner, border, and interaction.</p></div></div>`],
    ['Progress', `<div class="p-row p-small"><span>Making progress</span><strong data-progress-label>64%</strong></div><progress class="p-progress" value="64" max="100" aria-label="Project progress"></progress><button class="p-text-button" data-action="advance-progress">A step forward ${i('arrowRight', 15)}</button>`],
    ['Radio group', `<fieldset class="p-fieldset"><legend>Choose your plan</legend><label class="p-check"><input type="radio" name="plan" value="personal" checked> Personal <span class="p-muted">Free</span></label><label class="p-check"><input type="radio" name="plan" value="studio"> Studio <span class="p-muted">$12 / month</span></label><label class="p-check"><input type="radio" name="plan" value="team"> Team <span class="p-muted">$29 / month</span></label></fieldset>`],
    ['Select', `<label class="p-field">Home sweet home<select class="p-input"><option>San Francisco, CA</option><option>New York, NY</option><option>London, UK</option><option>Copenhagen, DK</option><option>Tokyo, JP</option></select></label><p class="p-small p-muted">Great ideas can come from anywhere.</p>`],
    ['Slider', `<div class="p-row p-small"><label for="volume-slider">Find your balance</label><strong><span data-range-output="volume">42</span>%</strong></div><input id="volume-slider" class="p-range" type="range" min="0" max="100" value="42" data-range="volume"><div class="p-row p-muted p-tiny"><span>A little</span><span>A lot</span></div>`],
    ['Switch', `<label class="p-row p-switch-label"><span><strong>Notifications</strong><small>Keep good things on your radar.</small></span><input class="p-switch" type="checkbox" checked aria-label="Notifications"></label><label class="p-row p-switch-label"><span><strong>Quiet hours</strong><small>A little space to disconnect.</small></span><input class="p-switch" type="checkbox" aria-label="Quiet hours"></label>`],
    ['Tabs', `<div class="p-tabs" role="tablist" aria-label="Example tabs"><button class="is-active" role="tab" aria-selected="true" data-component-tab="Overview">Overview</button><button role="tab" aria-selected="false" data-component-tab="Activity">Activity</button><button role="tab" aria-selected="false" data-component-tab="Settings">Settings</button></div><div class="component-tab-content" role="tabpanel">A fresh perspective. Everything you need, right here.</div>`],
    ['Text area', `<label class="p-field">What's on your mind?<textarea class="p-input p-textarea" rows="3" placeholder="Every good thing starts with an idea…"></textarea></label>`],
    ['Toast', `<p class="p-small p-muted">Good news deserves a small moment.</p>${button(`Show a notification ${i('bell', 15)}`, 'data-action="show-toast"')}`],
    ['Tooltip', `<div class="tooltip-example"><span class="p-tooltip-wrap"><button class="p-icon-button p-tooltip-target" aria-label="Copy link">${i('copy', 19)}</button><span role="tooltip">Copy a little inspiration</span></span><span class="p-muted p-small">Hover or focus to discover.</span></div>`],
    ['Toggle group', `<div class="p-toggle-group" role="group" aria-label="Text alignment"><button aria-pressed="true" class="is-active" data-toggle-value="Left">Left</button><button aria-pressed="false" data-toggle-value="Center">Center</button><button aria-pressed="false" data-toggle-value="Right">Right</button></div><p class="p-small p-muted" data-alignment-preview>A place for every little thing.</p>`],
  ];
  const matching = examples.filter(([name]) => name.toLowerCase().includes(filter.toLowerCase().trim()));
  if (!matching.length) return `<div class="preview-empty">${i('search', 30)}<h3>No components found</h3><p>Try a different search.</p></div>`;
  const editable = { Button: 'button', Input: 'input', Select: 'select', 'Text area': 'textarea', Switch: 'switch' };
  return `<div class="component-specimens">${matching.map(([name, content]) => {
    const edit = editable[name] ? `<button type="button" class="p-icon-button component-edit" data-edit-component="${editable[name]}" aria-label="Customize ${name}" title="Customize ${name}">${i('pen', 14)}</button>` : '';
    return tile(name, `<div class="component-heading"><h3 class="component-title">${name}</h3>${edit}</div><div class="component-body">${content}</div>`, 'component-specimen');
  }).join('')}</div>`;
}

export function renderPreview({ tab = 'theme', theme = {}, filter = '' } = {}) {
  return `<div class="preview" aria-label="${escape(theme.name || 'Custom theme')} live preview">${tab === 'components' ? componentGallery(filter) : (renderSpecialOverview(theme) || renderStandardOverview({ theme }))}<dialog class="p-dialog"><form method="dialog"><button class="p-icon-button dialog-close" aria-label="Close dialog" value="cancel" formnovalidate>${i('close', 18)}</button><span class="dialog-symbol">${i('sparkles', 25)}</span><h2>Make room for good ideas.</h2><p>Every project starts somewhere. Give yours a name and see where it takes you.</p><label class="p-field">Project name<input class="p-input" name="project" placeholder="Something wonderful" required></label><div class="dialog-actions"><button class="p-button p-button-secondary" value="cancel" formnovalidate>Cancel</button><button class="p-button" value="create">Create project ${i('plus', 15)}</button></div></form></dialog></div>`;
}

const bindings = new WeakMap();

export function bindPreview(container, { notify = () => {}, onSelectComponent = () => {} } = {}) {
  bindStandardOverview(container, { notify });
  bindSpecialOverview(container, { notify });
  bindings.get(container)?.abort();
  const controller = new AbortController();
  bindings.set(container, controller);
  const options = { signal: controller.signal };
  const toast = (message) => notify(message);
  const updateTypography = () => {
    const output = container.querySelector('[data-font-name]');
    if (!output) return;
    const styles = getComputedStyle(container);
    const family = (styles.getPropertyValue('--font-brand') || styles.getPropertyValue('--t-font')).trim();
    const name = family.split(',')[0].trim().replace(/^["']|["']$/g, '').replace(/^Sidebar /, '');
    if (name) output.textContent = name;
  };
  const observer = new MutationObserver(updateTypography);
  observer.observe(container, { attributes: true, attributeFilter: ['style', 'data-preset'] });
  controller.signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  queueMicrotask(updateTypography);

  container.addEventListener('keydown', (event) => {
    if(event.defaultPrevented)return;
    const tab = event.target.closest('[role="tab"]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  }, options);

  container.addEventListener('input', (event) => {
    const range = event.target.closest('[data-range]');
    if (range) container.querySelectorAll(`[data-range-output="${range.dataset.range}"]`).forEach((output) => { output.textContent = range.value; });
  }, options);

  container.addEventListener('submit', (event) => {
    if (event.target.matches('[data-demo-form]')) {
      event.preventDefault();
      const data = new FormData(event.target);
      toast(`Changes saved for ${data.get('company') || 'your company'}.`);
    }
    if (event.target.matches('[data-reply-form]')) {
      event.preventDefault();
      const textarea = event.target.querySelector('textarea');
      if (textarea.value.trim()) { textarea.value = ''; toast('Your reply has been sent.'); }
    }
  }, options);

  container.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.editComponent) {
      event.preventDefault();
      onSelectComponent(button.dataset.editComponent);
      return;
    }
    if (button.dataset.step) {
      const input = button.closest('.p-number-field').querySelector('input');
      input.value = Math.min(Number(input.max || 99), Math.max(Number(input.min || 0), Number(input.value) + Number(button.dataset.step)));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (button.dataset.previewNav) {
      button.parentElement.querySelectorAll('button').forEach((item) => { item.classList.toggle('is-active', item === button); item.setAttribute('aria-selected', String(item === button)); });
      container.querySelector('[data-workspace-status]').textContent = `${button.dataset.previewNav} selected`;
    }
    if (button.dataset.updates) {
      button.parentElement.querySelectorAll('button').forEach((item) => { item.classList.toggle('is-active', item === button); item.setAttribute('aria-selected', String(item === button)); });
      button.closest('.specimen').querySelectorAll('[data-update-kind]').forEach((item) => { item.hidden = button.dataset.updates === 'mentions'; });
    }
    if (button.dataset.componentTab) {
      button.parentElement.querySelectorAll('button').forEach((item) => { item.classList.toggle('is-active', item === button); item.setAttribute('aria-selected', String(item === button)); });
      const copy = { Overview: 'A fresh perspective. Everything you need, right here.', Activity: 'You created a project, invited your team, and made a little progress.', Settings: 'Your workspace, your way. Make yourself at home.' };
      button.closest('.specimen').querySelector('.component-tab-content').textContent = copy[button.dataset.componentTab];
    }
    if (button.dataset.toggleValue) {
      button.parentElement.querySelectorAll('button').forEach((item) => { item.classList.toggle('is-active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
      button.closest('.specimen').querySelector('[data-alignment-preview]').style.textAlign = button.dataset.toggleValue.toLowerCase();
    }
    if (button.dataset.menuChoice) {
      button.closest('.p-menu').hidden = true;
      button.closest('.p-menu-wrap').querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
      toast(`${button.dataset.menuChoice} selected.`);
    }
    if (button.dataset.icon) toast(`${button.dataset.icon.charAt(0).toUpperCase() + button.dataset.icon.slice(1)} icon selected.`);
    const action = button.dataset.action;
    if (!action) return;
    if (action === 'open-dialog' || action === 'create') {
      const dialog = container.querySelector('dialog');
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (action === 'toggle-menu' || action === 'toggle-popover') {
      const panel = button.nextElementSibling;
      panel.hidden = !panel.hidden;
      button.setAttribute('aria-expanded', String(!panel.hidden));
    } else if (action === 'advance-progress') {
      const specimen = button.closest('.specimen');
      const progress = specimen.querySelector('progress');
      progress.value = progress.value >= 100 ? 0 : Math.min(100, progress.value + 12);
      specimen.querySelector('[data-progress-label]').textContent = `${progress.value}%`;
      if (progress.value === 100) toast('All done. A little progress goes a long way.');
    } else if (action === 'chart-period') {
      const monthly = button.textContent.includes('week');
      button.innerHTML = `${monthly ? 'This month' : 'This week'} ${i('chevronDown', 13)}`;
      container.querySelector('[data-chart-total]').textContent = monthly ? '32,614' : '8,420';
      container.querySelector('[data-chart-trend]').textContent = monthly ? '+24.6%' : '+18.2%';
    } else {
      const messages = {
        'send-payment': 'Payment demo complete. Looking good!',
        'add-payment': 'This is a live theme preview. No payment details needed.',
        'workspace-settings': 'Workspace settings selected.',
        explore: 'A little curiosity goes a long way.',
        'show-toast': 'Saved! Your good idea is in good hands.',
        'component-primary': 'Primary action complete.',
        'component-secondary': 'Secondary action complete.',
        'component-text': 'A little action, a little progress.',
      };
      toast(messages[action] || 'Done.');
    }
  }, options);

  container.addEventListener('close', (event) => {
    if (event.target.matches('.p-dialog') && event.target.returnValue === 'create') {
      const name = event.target.querySelector('[name="project"]').value.trim();
      toast(`Created ${name || 'your new project'}.`);
      event.target.querySelector('form').reset();
    }
  }, { capture: true, signal: controller.signal });
}
