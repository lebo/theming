import { icon } from './icons.js';
import { themeTypography } from './theme.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const i = (name, size = 18) => icon(name, size);
const svg = (paths, size = 18) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="var(--icon-stroke-width,2)" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const book = () => svg('<path d="M12 5v16M12 5C9 2 4 3 2 3v16c5-1 7 0 10 2 3-2 5-3 10-2V3c-4-1-7 0-10 2Z"/>');
const box = () => svg('<path d="m3 7 9-4 9 4v10l-9 4-9-4ZM3 7l9 4 9-4M12 11v10M7 5l10 5"/>',22);
const calendar = () => svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>');
const pin = () => svg('<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',14);
const card = () => svg('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h3"/>',14);
const tile = (name, content, className = '') => `<article class="sp-tile specimen ${className}" aria-label="${escape(name)}" data-specimen="${escape(name.toLowerCase())}">${content}</article>`;
const surface = (content, className = '') => `<div class="sp-surface ${className}">${content}</div>`;
const button = (label, action, {variant = 'primary', className = '', before = '', after = '', attrs = ''} = {}) => `<button type="button" class="sp-button p-button ${className}" data-sp-variant="${variant}"${action ? ` data-special-action="${action}"` : ''} ${attrs}>${before}<span>${label}</span>${after}</button>`;
const columns = (left, right, preset) => `<section class="special-overview sp-${preset}" aria-label="${preset === 'canvas' ? 'Technical' : preset === 'jelly' ? 'Social' : preset === 'paper' ? 'Editorial' : 'Commerce'} theme overview"><div class="sp-board"><div class="sp-column">${left.join('')}</div><div class="sp-column sp-column-right">${right.join('')}</div></div></section>`;

function palette() {
  return tile('Theme color palette', `<figure class="sp-palette" aria-label="Four brand colors and ten neutrals"><div class="sp-brand-ramp">${[1,2,3,4].map(n => `<span style="background:var(--color-${n})" aria-label="Color ${n}"></span>`).join('')}</div><div class="sp-neutral-ramp">${Array.from({length:10},(_,n)=>`<span style="background:var(--neutral-${n+1})" aria-label="Neutral ${n+1}"></span>`).join('')}</div></figure>`, 'sp-foundation');
}
function typography(theme) {
  const family = themeTypography(theme).label;
  return tile('Typography', `<figure class="sp-type" aria-label="${escape(family)} type specimen"><div class="sp-type-glyphs"><span>Aa</span><span>123</span><span>#&!</span></div><div class="sp-type-details"><span class="sp-type-family" data-typography-family>${escape(family)}</span><div class="sp-type-weights"><span>Regular</span><span>Medium</span><span>Heavy</span></div></div></figure>`, 'sp-foundation');
}
const person = (initials, color = 1, online = false) => `<span class="sp-person"><span class="sp-avatar sp-avatar-${color}">${initials}</span>${online ? '<span class="sp-online" aria-label="Online"></span>' : ''}</span>`;
const people = (content) => `<div class="sp-people" aria-label="Community members">${content}</div>`;

function jelly(theme) {
  const community = tile('Community invitation', surface(`<span class="sp-celebration">🎉</span><h2>Your circle is growing!</h2>${people(person('MC',1)+person('LP',2)+person('NP',3)+'<span class="sp-more-people">+20</span>')}${button('Invite friends','invite',{className:'sp-full',before:i('plus')})}`, 'sp-community-card'), 'sp-community');
  const poll = tile('Weekend plans', surface(`<h2>What’s the plan?</h2><div class="sp-poll-options" role="radiogroup" aria-label="Weekend plans">${[['Picnic in the park','Blankets, snacks & sunshine','🧺'],['Pizza night','One of everything, please','🍕']].map(([title,desc,emoji],index)=>`<label class="sp-poll-option"><input type="radio" name="special-weekend-plan" value="${index}"${index===0?' checked':''}><span><strong>${title}</strong><small>${desc}</small></span><b>${emoji}</b></label>`).join('')}</div>`, 'sp-poll'));
  const welcome = tile('New community member', surface(`${person('MC',1,true)}<div class="sp-member-copy"><strong>Maya joined!</strong><small>Say a little hello.</small></div>${button('Wave','wave',{variant:'soft',className:'sp-small',before:'<span>👋</span>'})}`, 'sp-welcome'));
  const chat = tile('Community conversation', surface(`<header class="sp-chat-header">${person('LP',2)}<div class="sp-member-copy"><strong>Leo Park</strong><small>Just now · Weekend crew</small></div></header><p>In town this weekend! Who’s up for coffee and a very long walk? ☀️</p><div class="sp-reactions">${[['🙌',7],['❤️',3],['🎉',1]].map(([emoji,count])=>button(String(count),'reaction',{variant:'ghost',className:'sp-small',before:`<span>${emoji}</span>`,attrs:'aria-pressed="false"'})).join('')}${button('','add-reaction',{variant:'ghost',className:'sp-reaction-add',before:i('plus'),attrs:'aria-label="Add reaction"'})}</div>`, 'sp-chat'));
  const hangout = tile('Community hangout', surface(`<div class="sp-event-header"><div class="sp-event-date"><span>JUN</span><strong>24</strong></div><div><h2>A little coffee break</h2><div class="sp-event-meta"><span>Saturday · 10:30 am</span><span>${pin()}The café</span></div></div></div><div class="sp-event-footer">${people(person('MC',1)+person('NP',3)+'<span class="sp-attending"><span data-attendee-count>8</span> going</span>')}${button('Join','join',{variant:'soft',className:'sp-small',before:i('plus'),attrs:'aria-pressed="false"'})}</div>`, 'sp-hangout-card'), 'sp-hangout');
  return columns([community,palette(),poll],[typography(theme),welcome,chat,hangout],'jelly');
}
function paper(theme) {
  const brief = tile('Quarterly brief', `<section class="sp-brief"><header><span>${book()}Fieldnotes</span><small>No. 024</small></header><div class="sp-brief-copy"><h2>What matters this quarter.</h2></div><footer>${button('Read brief','brief',{variant:'secondary',after:i('arrowRight'),attrs:'aria-expanded="false"'})}<p class="sp-brief-panel" hidden>This quarter, we’re focusing on fewer priorities, clearer ownership, and steady progress. Protect time for the work that matters, share what you learn, and leave room to adjust.</p></footer></section>`);
  const workspace = tile('Workspace review', surface(`<header class="sp-heading"><span class="sp-icon-box">${i('folder')}</span><h2>Your workspace</h2></header><ul class="sp-review-list">${[['Company policies','Up to date','file'],['Account access','Verified','users'],['Quarterly report','Ready for you','chart']].map(([title,state,glyph],index)=>`<li><span>${i(glyph,16)}${title}</span><span class="sp-status ${index===2?'sp-pending':''}">${index===2?'':i('check',12)}${state}</span></li>`).join('')}</ul>${button('Complete review','review',{className:'sp-full',after:i('check')})}`, 'sp-workspace'));
  const report = tile('Readiness report', surface(`<div class="sp-metric-row"><div><h2>98<span>%</span></h2><p class="sp-muted">Workspace readiness</p></div><span class="sp-status">${i('arrowUpRight',12)}+6%</span></div><figure class="sp-report-chart" aria-label="Readiness grew from 92 percent in April to 98 percent in September"><svg viewBox="0 0 360 104" fill="none" aria-hidden="true"><path class="sp-chart-grid" d="M0 24H360M0 56H360M0 88H360"/><path class="sp-chart-area" d="M0 87C30 87 34 64 70 69S115 53 145 57S193 31 218 37S265 15 288 22S331 9 360 8V104H0Z"/><path class="sp-chart-line" d="M0 87C30 87 34 64 70 69S115 53 145 57S193 31 218 37S265 15 288 22S331 9 360 8"/></svg><figcaption>${['Apr','May','Jun','Jul','Aug','Sep'].map(x=>`<span>${x}</span>`).join('')}</figcaption></figure>`, 'sp-report'));
  const appointment = tile('Upcoming review', surface(`<header class="sp-heading"><div class="sp-paper-date"><span>OCT</span><strong>08</strong></div><div><h2>A moment to look ahead.</h2><p class="sp-muted">Quarterly review · 10:00 am</p></div></header><div>${button('Remind me','remind',{variant:'soft',className:'sp-small',before:i('bell',14)})}</div>`, 'sp-appointment'));
  return columns([brief,palette(),workspace],[typography(theme),report,appointment],'paper');
}

function canvas(theme) {
  const runs = [3,2,1].map((run,index)=>`<tr><td>${run}</td><td>$0.028</td><td>${(1+index*.1).toFixed(1)}s</td><td>${(4.1-index*.3).toFixed(1)}</td><td><span class="sp-run-status ${index===2?'is-no':''}">${index===2?'NO':'YES'}</span></td></tr>`).join('');
  const pipeline = tile('Production pipeline', surface(`<header class="sp-pipeline-heading"><strong>Production pipeline</strong><div>${button('Test','test',{variant:'secondary',before:i('play',16)})}${button('Deploy','deploy',{before:i('upload',16)})}</div></header><div class="sp-table-wrap"><table aria-label="Recent pipeline runs"><thead><tr>${['Run','Cost','Duration','Score','Approved'].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${runs}</tbody></table></div>`, 'sp-pipeline'));
  const latency = tile('Request latency', surface(`<header class="sp-row"><strong>Request latency</strong><small>p95 · 1h</small></header><div class="sp-latency-number">48<span>ms</span><small>↓ 12.4%</small></div><svg class="sp-latency-chart" viewBox="0 0 360 96" aria-label="Request latency decreased over the last hour"><path class="sp-chart-grid" d="M0 10H330M0 43H330M0 76H330"/><path class="sp-chart-area" d="M0 68 13 70 23 64 34 68 48 18 55 62 68 70 79 67 88 74 99 69 115 70 127 51 139 66 151 70 165 64 178 68 196 34 202 66 214 71 228 69 240 76 251 66 264 69 277 63 287 46 298 62 310 70 323 66 335 55 347 58 360 55V96H0Z"/><path class="sp-chart-line" d="M0 68 13 70 23 64 34 68 48 18 55 62 68 70 79 67 88 74 99 69 115 70 127 51 139 66 151 70 165 64 178 68 196 34 202 66 214 71 228 69 240 76 251 66 264 69 277 63 287 46 298 62 310 70 323 66 335 55 347 58 360 55"/></svg><div class="sp-chart-times"><span>14:00</span><span>14:30</span><span>15:00</span></div>`, 'sp-latency'));
  const secrets = tile('Secret actions', surface(`${button('Create Secret','secret',{before:i('plus',16)})}${button('Creating…',null,{before:'<span class="sp-spinner"></span>',attrs:'disabled aria-busy="true"'})}${button('Delete Secret','delete-secret',{variant:'danger',before:i('trash',16)})}`, 'sp-secrets'));
  const evaluations = tile('Evaluations', surface(`<header class="sp-row"><strong>Evals</strong>${button('','add-eval',{variant:'secondary',className:'sp-square',before:i('plus'),attrs:'aria-label="Add evaluation"'})}</header><div class="sp-eval-list">${[['Cost','cost'],['Latency','latency'],['Answer Helpfulness','helpfulness']].map(([title,key])=>`<button type="button" class="sp-eval-row p-button" data-special-action="evaluation" aria-pressed="false">${i(key === 'cost' ? 'chart' : key === 'latency' ? 'clock' : 'sliders',16)}<span>${title}<small>${key}</small></span>${i('chevronDown',16)}</button>`).join('')}</div>`, 'sp-evals'));
  const model = tile('Model settings', surface(`<div class="sp-row"><strong>${i('sparkles',20)}GPT-6</strong>${i('chevronDown',16)}</div><div class="sp-model-setting"><label for="special-model-length">Max Length</label><span class="sp-number p-number-field"><button type="button" data-special-action="model-down" aria-label="Decrease maximum length">${i('minus')}</button><input id="special-model-length" type="number" min="1" max="4096" step="64" value="256"><button type="button" data-special-action="model-up" aria-label="Increase maximum length">${i('plus')}</button></span></div>`, 'sp-model'));
  const logs = [['14:50:22','Building image im-prreydvahzckzbst'],['14:50:45','Creating image snapshot...'],['14:52:07','Finished snapshot; took 357.4512ms']];
  const build = tile('Build log', surface(`<div class="sp-build-lines">${logs.map(([time,message])=>`<div><time>Feb 19 ${time}</time><p>${message}</p></div>`).join('')}</div><span class="sp-listening"><i></i><span data-pipeline-state>Listening</span></span>`, 'sp-build'));
  return columns([pipeline,latency,palette(),secrets],[evaluations,typography(theme),model,build],'canvas');
}

function alloy(theme) {
  const discount = tile('Discount campaign', `<div class="sp-campaign"><div class="sp-offer"><div class="sp-offer-main"><header><span>${svg('<path d="m3 3 8 .1 10 10-8 8L3 11Z"/><circle cx="7.5" cy="7.5" r="1"/>',14)}Discount</span><span class="sp-draft" data-discount-state>Draft</span></header><div class="sp-discount-amount"><strong>25</strong><span><b>%</b><small>off</small></span></div><h2>Summer sale</h2></div><div class="sp-offer-seam" aria-hidden="true"></div><div class="sp-offer-details"><strong>SUMMER25</strong><span>All products</span></div></div><div class="sp-campaign-footer"><div class="sp-campaign-glass"><span>${calendar()}Jun 21 – Jul 05</span><div>${button('Preview','discount-preview',{variant:'secondary',className:'sp-small'})}${button('Schedule','schedule',{className:'sp-small'})}</div></div></div></div>`);
  const bag = tile('Shopping bag', surface(`<header class="sp-row"><h2>Your bag</h2>${i('folder',18)}</header><div class="sp-item-copy"><strong>Cotton overshirt</strong><small>Natural / Medium</small><span>$84.00</span></div><div class="sp-row"><label class="sp-muted" for="special-bag-quantity">Quantity</label><div class="sp-quantity">${button('','quantity-down',{variant:'secondary',className:'sp-small',before:i('minus',14),attrs:'aria-label="Decrease quantity"'})}<input class="p-input" id="special-bag-quantity" type="number" min="1" max="99" value="3" aria-label="Bag quantity">${button('','quantity-up',{variant:'secondary',className:'sp-small',before:i('plus',14),attrs:'aria-label="Increase quantity"'})}</div></div><div class="sp-totals"><div class="sp-row"><span>Subtotal</span><span data-bag-total>$252.00</span></div><div class="sp-row"><span>Shipping</span><span>Free</span></div><div class="sp-row sp-total"><strong>Total</strong><strong data-bag-total>$252.00</strong></div></div>${button('Checkout','checkout',{className:'sp-small sp-full',before:card()})}`, 'sp-bag'));
  const order = tile('Order fulfillment', surface(`<header class="sp-row"><h2>Order #1084</h2><span class="sp-status">${i('check',12)}Paid</span></header><div class="sp-order-product"><span class="sp-package">${box()}</span><div class="sp-item-copy"><strong>Cotton overshirt</strong><small>3 items · Ground shipping</small></div></div><div class="sp-order-details"><div><small>CUSTOMER</small><span>Alex Morgan</span></div><div><small>DESTINATION</small><span>Brooklyn, NY</span></div></div>${button('Create shipping label','shipping-label',{variant:'secondary',className:'sp-small sp-full',before:i('file',14)})}`, 'sp-order'));
  const delivery = tile('Delivery options', surface(`<header class="sp-row"><h2>Delivery</h2><p class="sp-tracking"><i></i>Tracking included</p></header><div class="sp-shipping-options" role="group" aria-label="Delivery method">${[['Standard','3–5 days · Free'],['Express','1–2 days · $8']].map(([name,desc],index)=>`<button type="button" class="p-button sp-shipping-option" data-special-action="delivery" aria-pressed="${index===0}"><span>${name}</span><small>${desc}</small></button>`).join('')}</div>`, 'sp-delivery'));
  return columns([discount,palette(),bag],[order,typography(theme),delivery],'alloy');
}

/** Distinct public reference compositions; Felt and Base use the standard gallery. */
export function renderSpecialOverview(theme) {
  const render = { canvas, jelly, paper, alloy }[theme.preset];
  return render ? render(theme) : null;
}

/** All controls operate on local preview state only. */
export function bindSpecialOverview(container, { notify = () => {} } = {}) {
  const overview = container.querySelector('.special-overview');
  if (!overview) return;
  const preview = overview.closest('.preview');
  if (preview && typeof MutationObserver !== 'undefined') {
    const syncFamily = () => {
      const family = getComputedStyle(preview).getPropertyValue('--font-brand').split(',')[0].replace(/["']/g, '').trim();
      const label = overview.querySelector('[data-typography-family]');
      if (family && label) label.textContent = family;
    };
    const observer = new MutationObserver(() => {
      if (!overview.isConnected) { observer.disconnect(); return; }
      syncFamily();
    });
    observer.observe(preview, {attributes:true, attributeFilter:['style']});
  }
  const setLabel = (button, text) => { const label = button.querySelector(':scope > span:last-of-type'); if (label) label.textContent = text; };
  const syncBag = () => { const input = overview.querySelector('#special-bag-quantity'); if (!input) return; input.value = Math.max(1, Math.min(99, Number(input.value) || 1)); overview.querySelectorAll('[data-bag-total]').forEach(el => { el.textContent = `$${(Number(input.value) * 84).toFixed(2)}`; }); };
  overview.addEventListener('input', e => { if (e.target.id === 'special-bag-quantity') syncBag(); });
  overview.addEventListener('click', e => {
    const target = e.target.closest('[data-special-action]'); if (!target) return;
    const action = target.dataset.specialAction;
    if (action === 'reaction') { const active = target.getAttribute('aria-pressed') === 'true'; const count = target.querySelector(':scope > span:last-of-type'); count.textContent = Number(count.textContent) + (active ? -1 : 1); target.setAttribute('aria-pressed', String(!active)); }
    else if (action === 'join') { const active = target.getAttribute('aria-pressed') === 'true'; target.setAttribute('aria-pressed', String(!active)); setLabel(target, active ? 'Join' : 'Joined'); overview.querySelector('[data-attendee-count]').textContent = active ? '8' : '9'; }
    else if (action === 'wave') { setLabel(target,'Waved!'); target.classList.add('sp-waved'); }
    else if (action === 'invite') { setLabel(target,'Invited'); notify('Invitation preview sent to your circle.'); }
    else if (action === 'add-reaction') { const reaction = document.createElement('button'); reaction.type='button'; reaction.className='sp-button p-button sp-small'; reaction.dataset.spVariant='ghost'; reaction.dataset.specialAction='reaction'; reaction.setAttribute('aria-pressed','true'); reaction.innerHTML='<span>😊</span><span>1</span>'; target.before(reaction); target.disabled=true; }
    else if (action === 'brief') { const panel=target.closest('footer').querySelector('.sp-brief-panel'); panel.hidden=!panel.hidden; target.setAttribute('aria-expanded',String(!panel.hidden)); setLabel(target,panel.hidden?'Read brief':'Close brief'); }
    else if (action === 'review') { overview.querySelectorAll('.sp-review-list .sp-pending').forEach(el=>{el.classList.remove('sp-pending');el.textContent='Reviewed';});setLabel(target,'Review complete'); }
    else if (action === 'remind') { setLabel(target,'Reminder set');target.setAttribute('aria-pressed','true'); }
    else if (action.startsWith('quantity-')) { const input=overview.querySelector('#special-bag-quantity');input.value=Number(input.value)+(action.endsWith('up')?1:-1);syncBag(); }
    else if (action.startsWith('model-')) { const input=overview.querySelector('#special-model-length');input.value=Math.max(1,Math.min(4096,Number(input.value)+(action.endsWith('up')?64:-64))); }
    else if (action === 'delivery') { target.parentElement.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===target))); }
    else if (action === 'evaluation') { target.setAttribute('aria-pressed',String(target.getAttribute('aria-pressed')!=='true')); }
    else if (action === 'add-eval') { const row=overview.querySelector('.sp-eval-row').cloneNode(true);row.querySelector('span').innerHTML='New evaluation<small>evaluation</small>';overview.querySelector('.sp-eval-list').append(row); }
    else if (action === 'test') { setLabel(target,'Passed');notify('Pipeline test passed.'); }
    else if (action === 'deploy') { setLabel(target,'Deployed');overview.querySelector('[data-pipeline-state]').textContent='Deployment ready'; }
    else if (action === 'secret') { setLabel(target,'Secret created'); }
    else if (action === 'delete-secret') { setLabel(target,'Deleted');target.disabled=true; }
    else if (action === 'schedule') { overview.querySelector('[data-discount-state]').textContent='Scheduled';setLabel(target,'Scheduled'); }
    else if (action === 'discount-preview') { const offer=overview.querySelector('.sp-offer');offer.classList.toggle('sp-offer-preview');target.setAttribute('aria-expanded',String(offer.classList.contains('sp-offer-preview'))); }
    else if (action === 'shipping-label') { setLabel(target,'Label created'); }
    else if (action === 'checkout') { setLabel(target,'Checkout ready'); }
  });
}
