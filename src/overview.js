import { icon } from './icons.js';
import { themeTypography } from './theme.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyph = (name, size = 20) => icon(name, size);
const card = (name, body) => `<section class="so-card so-${name}" aria-label="${escape(name.replaceAll('-', ' '))}">${body}</section>`;
const customIcon = (name, size = 20) => {
  const paths = {
    attachment: '<path d="M8 13.5 15.5 6a3.2 3.2 0 0 1 4.5 4.5l-10 10a5 5 0 0 1-7-7l10-10a2 2 0 0 1 2.8 2.8L6 16a1.3 1.3 0 0 0 1.8 1.8l9-9"/>',
    stamp: '<path d="M8 4h8v3c0 2-2 3-2 5v2h4l2 4H4l2-4h4v-2c0-2-2-3-2-5zM4 21h16"/>',
    mailbox: '<path d="M4 11a5 5 0 0 1 10 0v8H4zm5-5h8a5 5 0 0 1 5 5v8h-8M9 19v4M18 8V2h4v3h-4M7 15h4"/>',
    sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M5 8h2m-2 4h2"/>',
    inbox: '<path d="m5 5-3 9v5h20v-5l-3-9zm-3 9h6l2 3h4l2-3h6"/>',
    arrowUp: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="var(--icon-stroke-width,2)" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
};

export function renderOverviewTypography(theme = {}) {
  let label = 'GT Standard';
  try { label = themeTypography(theme).fontBrand.split(',')[0].replaceAll('"','').trim().replace(/^Sidebar /,'').replace(/^GT Standard L$/,'GT Standard'); } catch {}
  return `<div class="so-type-layout"><div class="so-type-specimen"><div class="so-type-lines"><span>Aa</span><span>123</span><span>#&!</span></div></div><div class="so-type-details"><div class="so-type-family" data-so-font>${escape(label)}</div><div class="so-type-weights"><span>Regular</span><span>Medium</span><span>Heavy</span></div></div></div>`;
}

export function renderOverviewPalette() {
  return `<figure class="so-palette-figure" aria-label="Theme color palette"><div class="so-color-bands">${[1,2,3,4].map(n => `<span style="background:var(--color-${n})" aria-label="Color ${n}"></span>`).join('')}</div><div class="so-neutral-bands">${Array.from({length:10},(_,n) => `<span style="background:var(--neutral-${n+1})" aria-label="Neutral ${n+1}"></span>`).join('')}</div></figure>`;
}

function balance() {
  return card('balance', `<div class="so-balance-stack"><div class="so-balance-back" aria-hidden="true"></div><div class="so-surface so-balance-front"><div><div class="so-muted">Balance</div><div class="so-balance-amount" data-so-balance>$1,200.35</div></div><dl class="so-balance-details"><div><dt>Payment</dt><dd>$30.32</dd></div><div><dt>Due</dt><dd>Aug 9th</dd></div></dl><button class="p-button so-button so-pay" data-so-action="pay">Pay</button></div></div>`);
}
function payments() {
  return card('payments', `<fieldset class="so-payment-group" aria-label="Payment amount"><label class="so-payment-option"><input type="radio" name="standard-payment" value="500" checked><span class="so-payment-copy"><span>$500.00</span><small>Remaining balance</small></span><span class="so-recommended">Recommended</span></label><label class="so-payment-option"><input type="radio" name="standard-payment" value="250"><span class="so-payment-copy"><span>$250.00</span><small>Half now, half next month</small></span></label></fieldset>`);
}
function icons() {
  const items = [['file','Document'],['search','Search'],['attachment','Attachment'],['bell','Notifications'],['trash','Trash'],['stamp','Stamp'],['globe','Globe'],['pen','Pencil'],['mailbox','Mailbox']];
  return card('icons', `<div class="so-icons-grid">${items.map(([name,label]) => `<button aria-label="${label}" data-so-icon="${label}">${['attachment','stamp','mailbox'].includes(name) ? customIcon(name,48) : glyph(name,48)}</button>`).join('')}</div>`);
}
function rewards() {
  return card('rewards', `<div class="so-surface so-reward-surface"><div class="so-reward-slider"><label for="so-reward-range">Rewards multiple</label><div class="so-reward-well"><div class="so-reward-control"><div class="so-reward-dots" aria-hidden="true">${[1,2,3,4,5].map(n=>`<span style="left:${(n-1)*25}%"></span>`).join('')}</div><output class="so-reward-badge" for="so-reward-range" aria-hidden="true"><span class="so-reward-digits"><span class="so-reward-wheel">${[5,4,3,2,1].map(n=>`<span>${n}</span>`).join('')}</span></span><span class="so-reward-suffix">×</span></output><input id="so-reward-range" aria-label="Rewards multiple" aria-valuetext="4 times" type="range" min="1" max="5" step="1" value="4" data-so-reward></div></div></div></div>`);
}
function navigation() {
  const links = [['home','Overview'],['folder','Projects'],['inbox','Inbox'],['users','Team'],['settings','Settings']];
  return card('navigation', `<div class="so-navigation-frame"><aside class="so-navigation-sidebar"><header class="so-navigation-header"><button class="so-workspace" data-so-action="workspace">Work ${glyph('chevronDown',14)}</button><button class="so-sidebar-toggle" data-so-action="sidebar" aria-label="Collapse sidebar" aria-expanded="true">${customIcon('sidebar',16)}</button></header><nav class="so-navigation-list" aria-label="Example workspace navigation">${links.map(([name,label],index)=>`<button class="so-navigation-link${index===0?' is-active':''}" data-so-nav="${label}" ${index===0?'aria-current="page"':''}>${name==='inbox'?customIcon('inbox',16):glyph(name,16)}<span>${label}</span>${label==='Inbox'?'<span class="so-nav-count">8</span>':''}</button>`).join('')}</nav></aside><section class="so-navigation-page"><h3 data-so-page>Page</h3><div class="so-skeleton-list" aria-hidden="true">${Array.from({length:5},()=>'<div class="so-skeleton-row"><span class="so-skeleton-avatar"></span><div class="so-skeleton-copy"><i></i><i></i><i></i></div></div>').join('')}</div></section></div>`);
}
function company() {
  return card('company', `<form class="so-surface so-company-form" data-so-company><label class="so-field">Company<input class="p-input so-input" name="company" value="California" required></label><div class="so-roles-row"><label for="so-role-count">Roles</label><div class="so-number"><button type="button" data-so-step="-1" aria-label="Decrease roles">${glyph('minus',20)}</button><input class="so-number-input" id="so-role-count" type="number" min="0" max="99" value="2" aria-label="Roles"><button type="button" data-so-step="1" aria-label="Increase roles">${glyph('plus',20)}</button></div></div><label class="so-admin-row"><span>Admin</span><input class="p-switch so-switch" type="checkbox" role="switch" checked aria-label="Admin"></label><div class="so-form-actions"><button class="p-button so-button so-secondary" type="reset">Cancel</button><button class="p-button so-button" type="submit">Continue</button></div></form>`);
}
function tabs() {
  return card('tabs', `<div class="so-tabs-list" role="tablist" aria-label="Updates">${['All','Onboarding','Bugs','Ideas'].map((name,n)=>`<button role="tab" aria-selected="${n===0}" class="${n===0?'is-active':''}" data-so-tab="${name}">${name}</button>`).join('')}</div>`);
}
function settings() {
  return card('settings', `<dl class="so-model-settings"><div><dt>Provider</dt><dd><button class="so-setting-value" data-so-option="provider" data-so-options="Open AI|Anthropic|Google">Open AI ${glyph('chevronDown',12)}</button></dd></div><div><dt>Model</dt><dd><button class="so-setting-value" data-so-option="model" data-so-options="gpt-4o-2024-01-10|gpt-4o-mini|gpt-4.1">gpt-4o-2024-01-10 ${glyph('chevronDown',12)}</button></dd></div><div><dt>Temperature</dt><dd><input aria-label="Temperature" type="number" min="0" max="2" step="0.1" value="0.9"></dd></div></dl>`);
}
function filters() {
  return card('filters', `<div class="so-filter-rules"><div class="so-rule"><span>Date</span><button data-so-option="date-operator" data-so-options="is|is not|before|after" aria-label="Date operator">is</button><button data-so-option="date-range" data-so-options="Last 30 days|Last 7 days|Last 90 days" aria-label="Date range">Last 30 days</button></div><div class="so-rule"><span>userType</span><button data-so-option="user-operator" data-so-options="includes|excludes|equals" aria-label="User type operator">includes</button><button data-so-option="user-value" data-so-options="“pro”|“free”|“enterprise”" aria-label="User type">“pro”</button></div></div>`);
}
function sparkline() {
  const samples = [.05,.07,.86,.05,.06,.28,.4,.05,.07,.05,1,.05,.04,.16];
  const points = samples.map((value,index)=>`${(index*280/(samples.length-1)).toFixed(2)},${(98-value*92).toFixed(2)}`).join(' ');
  return card('sparkline', `<figure class="so-spark"><div class="so-spark-top"><strong>1.2 KB/min</strong><span>4:07pm</span></div><svg viewBox="0 0 280 104" role="img" aria-label="Activity sparkline, peaking at 1.2 KB per minute"><g class="so-spark-grid">${[.13,.38,.63,.88].map(fraction=>`<line x1="${fraction*280}" y1="6" x2="${fraction*280}" y2="98"/>`).join('')}</g><line class="so-spark-axis" x1="0" y1="98" x2="280" y2="98"/><polyline class="so-spark-series" points="${points}"/><circle cx="${10/13*280}" cy="6" r="3"/></svg><div class="so-spark-clocks"><span>2:20 PM</span><span>11:40 PM</span></div></figure>`);
}
function reply() {
  return card('reply', `<form class="so-surface so-reply-form" data-so-reply><p><span>@Scott</span> can you take a look at the latest changes? I’d love a second set of eyes before we share them with the team.</p><div class="so-reply-field"><input class="p-input so-reply-input" aria-label="Your reply" placeholder="Your reply" value="Yep, I’m on it!" required><button class="p-button so-reply-submit" aria-label="Add reply" type="submit">${customIcon('arrowUp',16)}</button></div></form>`);
}

export function renderStandardOverview({ theme = {} } = {}) {
  return `<section class="standard-overview" data-standard-preset="${escape(theme.preset||'felt')}" aria-label="Theme overview"><div class="so-board"><div class="so-column so-primary-column">${balance()}${payments()}${card('palette',renderOverviewPalette())}${icons()}${rewards()}</div><div class="so-column so-secondary-column">${card('typography',renderOverviewTypography(theme))}${navigation()}${company()}${tabs()}${settings()}${filters()}</div><div class="so-ending">${sparkline()}${reply()}</div></div></section>`;
}

const bound = new WeakMap();
export function bindStandardOverview(container, { notify = () => {} } = {}) {
  bound.get(container)?.abort();
  const controller = new AbortController(); bound.set(container,controller);
  const options={signal:controller.signal};
  const updateFont = () => {
    const name=container.querySelector('[data-so-font]');if(!name)return;
    const style=getComputedStyle(container);
    const label=(style.getPropertyValue('--font-brand')||style.getPropertyValue('--t-font')).split(',')[0].trim().replaceAll('"','').replace(/^Sidebar /,'').replace(/^GT Standard L$/,'GT Standard');
    if(label)name.textContent=label;
  };
  const observer=new MutationObserver(updateFont);observer.observe(container,{attributes:true,attributeFilter:['style','data-preset']});controller.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});queueMicrotask(updateFont);
  container.addEventListener('input',event=>{if(event.target.matches('[data-so-reward]')){const value=Number(event.target.value),control=event.target.closest('.so-reward-control');control.style.setProperty('--so-reward-position',`${(value-1)*25}%`);control.style.setProperty('--so-reward-value',String(value));event.target.setAttribute('aria-valuetext',`${value} times`);}},options);
  container.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||!button.closest('.standard-overview'))return;
    if(button.dataset.soStep){const input=button.closest('.so-number').querySelector('input');input.value=Math.max(0,Math.min(99,Number(input.value)+Number(button.dataset.soStep)));}
    if(button.dataset.soNav){button.closest('nav').querySelectorAll('button').forEach(el=>{el.classList.toggle('is-active',el===button);if(el===button)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});container.querySelector('[data-so-page]').textContent=button.dataset.soNav;}
    if(button.dataset.soTab){button.parentElement.querySelectorAll('button').forEach(el=>{el.classList.toggle('is-active',el===button);el.setAttribute('aria-selected',String(el===button));});}
    if(button.dataset.soOptions){const values=button.dataset.soOptions.split('|');const next=(Number(button.dataset.soIndex||0)+1)%values.length;button.dataset.soIndex=String(next);button.innerHTML=escape(values[next])+(button.classList.contains('so-setting-value')?` ${glyph('chevronDown',12)}`:'');}
    if(button.dataset.soAction==='pay'){button.textContent='Paid';button.disabled=true;notify('Payment complete.');}
    if(button.dataset.soAction==='workspace'){button.innerHTML=`${button.textContent.trim()==='Work'?'Personal':'Work'} ${glyph('chevronDown',14)}`;}
    if(button.dataset.soAction==='sidebar'){const frame=button.closest('.so-navigation-frame');frame.classList.toggle('is-collapsed');button.setAttribute('aria-expanded',String(!frame.classList.contains('is-collapsed')));button.setAttribute('aria-label',frame.classList.contains('is-collapsed')?'Expand sidebar':'Collapse sidebar');}
  },options);
  container.addEventListener('submit',event=>{if(event.target.matches('[data-so-company]')){event.preventDefault();notify('Company settings saved.');}if(event.target.matches('[data-so-reply]')){event.preventDefault();const input=event.target.querySelector('input');if(input.value.trim()){input.value='';notify('Reply added.');}}},options);
  container.addEventListener('keydown',event=>{const tab=event.target.closest('[data-so-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const tabs=[...tab.parentElement.children];let next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(tabs.indexOf(tab)+(event.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length;event.preventDefault();tabs[next].focus();tabs[next].click();},options);
}
