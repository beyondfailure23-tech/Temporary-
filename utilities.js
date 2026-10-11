/* ══════════════════════════════════════════════════
   Beyond Failure — Utilities (utilities.js)
   Naya tool add karna ho to sirf neeche TOOLS list mein ek entry jodo.
   live:true  -> tool khulega
   live:false -> "Coming Soon" dikhega
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Number helpers ──
  const fmt = n => (isFinite(n) ? Math.round(n).toLocaleString('en-IN') : '—');
  const rupee = n => '₹ ' + fmt(n);

  // ── Groups (screen par ye order dikhega) ──
  const GROUPS = [
    { id: 'loan',     name: '🏦 Loan & EMI' },
    { id: 'invest',   name: '📈 Investment' },
    { id: 'interest', name: '🧮 Interest & Returns' },
    { id: 'tax',      name: '🧾 Tax & Salary' },
    { id: 'personal', name: '💰 Personal Finance' }
  ];

  // ── TOOLS ──
  const TOOLS = [
    // Loan & EMI
    { id: 'home-loan',     group: 'loan', emoji: '🏠', name: 'Home Loan',        live: false },
    {
      id: 'emi', group: 'loan', emoji: '💳', name: 'EMI Calculator', live: true,
      fields: [
        { key: 'amount', label: 'Loan Amount (₹)',        def: 1100000 },
        { key: 'years',  label: 'Tenure (Years)',         def: 3 },
        { key: 'rate',   label: 'Interest Rate (% per year)', def: 9 }
      ],
      compute: v => {
        const P = v.amount, n = v.years * 12, r = v.rate / 12 / 100;
        if (!(P > 0) || !(n > 0) || v.rate < 0) return null;
        const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const total = emi * n;
        return [
          { label: 'Monthly EMI', value: rupee(emi), big: true },
          { label: 'Interest Amount', value: rupee(total - P) },
          { label: 'Total Payable Amount', value: rupee(total) }
        ];
      }
    },
    { id: 'car-loan',      group: 'loan', emoji: '🚗', name: 'Car Loan EMI',     live: false },
    { id: 'personal-loan', group: 'loan', emoji: '👤', name: 'Personal Loan EMI', live: false },
    { id: 'down-payment',  group: 'loan', emoji: '🏡', name: 'Down Payment',     live: false },
    { id: 'flat-reducing', group: 'loan', emoji: '⚖️', name: 'Flat vs Reducing', live: false },

    // Investment
    {
      id: 'sip', group: 'invest', emoji: '📈', name: 'SIP Calculator', live: true,
      fields: [
        { key: 'mode', label: 'Investment Type', type: 'choice', options: ['SIP', 'Lumpsum'], def: 'SIP' },
        { key: 'amount', label: v => (v.mode === 'SIP' ? 'Monthly Investment (₹)' : 'Investment Amount (₹)'), def: 40000 },
        { key: 'rate',   label: 'Expected Return (% per year)', def: 18 },
        { key: 'years',  label: 'Time Period (Years)', def: 5 }
      ],
      compute: v => {
        const A = v.amount, y = v.years, R = v.rate / 100;
        if (!(A > 0) || !(y > 0) || v.rate < 0) return null;
        let invested, value;
        if (v.mode === 'Lumpsum') {
          invested = A;
          value = A * Math.pow(1 + R, y);
        } else {
          const i = R / 12, m = y * 12;
          invested = A * m;
          value = i === 0 ? A * m : A * ((Math.pow(1 + i, m) - 1) / i) * (1 + i); // har mahine ke shuru mein
        }
        return [
          { label: 'Total Value', value: rupee(value), big: true },
          { label: 'Invested Amount', value: rupee(invested) },
          { label: 'Estimated Returns', value: rupee(value - invested) }
        ];
      }
    },
    { id: 'ppf',     group: 'invest', emoji: '🏦', name: 'PPF Calculator', live: false },
    { id: 'nps',     group: 'invest', emoji: '👴', name: 'NPS Calculator', live: false },
    { id: 'fd',      group: 'invest', emoji: '💰', name: 'FD Interest',    live: false },

    // Interest & Returns
    { id: 'simple-int',   group: 'interest', emoji: '➕', name: 'Simple Interest',   live: false },
    { id: 'compound-int', group: 'interest', emoji: '📊', name: 'Compound Interest', live: false },
    { id: 'cagr',         group: 'interest', emoji: '🚀', name: 'CAGR',              live: false },
    { id: 'roi',          group: 'interest', emoji: '🎯', name: 'ROI',               live: false },

    // Tax & Salary
    { id: 'cap-gains', group: 'tax', emoji: '🧾', name: 'Capital Gains', live: false },
    { id: 'gratuity',  group: 'tax', emoji: '🎁', name: 'Gratuity',      live: false },
    { id: 'ctc',       group: 'tax', emoji: '💼', name: 'CTC Calculator', live: false },

    // Personal Finance
    { id: 'expense', group: 'personal', emoji: '🧮', name: 'Monthly Expense', live: false }
  ];

  // ── Styles (sirf Utilities ke liye) ──
  const css = `
  .util-group-head { margin: 18px 16px 10px; }
  .util-group-chip { display:inline-block; background: var(--inter-bg); border:1.5px solid var(--inter-border);
    color: var(--inter); border-radius: 8px; padding: 4px 14px; font-size: 12px; font-weight: 800; }
  .util-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 16px; }
  .util-tile { background: var(--white); border:1px solid var(--border); border-radius:16px; box-shadow: var(--shadow);
    padding: 16px 10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
    min-height: 96px; text-align:center; cursor:pointer; position:relative; transition: transform .2s; }
  .util-tile:active { transform: scale(0.96); }
  .util-tile.soon { opacity: .55; }
  .util-tile-emoji { font-size: 26px; }
  .util-tile-name { font-size: 12.5px; font-weight: 700; color: var(--text); line-height: 1.3; }
  .util-soon-badge { position:absolute; top:6px; right:6px; font-size:9px; font-weight:700; color:#fff;
    background: linear-gradient(135deg,#F59E0B,#EF4444); padding:2px 7px; border-radius:20px; }
  .util-result-card { margin: 16px; background: linear-gradient(135deg,#1E3A8A,#2563EB 55%,#4F46E5);
    border-radius: 20px; padding: 18px 20px; color:#fff; box-shadow: 0 8px 24px rgba(37,99,235,.25); }
  .util-result-big-label { font-size: 12px; font-weight:600; color:#BFDBFE; }
  .util-result-big { font-family: var(--font-head); font-size: 30px; font-weight: 800; margin: 2px 0 12px; word-break: break-word; }
  .util-result-row { display:flex; justify-content:space-between; gap:10px; padding: 9px 0; border-top:1px solid rgba(255,255,255,.2);
    font-size: 13px; }
  .util-result-row b { font-weight: 800; text-align:right; }
  .util-note { margin: 0 16px 16px; font-size: 11px; color: var(--muted); line-height:1.5; }
  .util-form { padding: 16px 16px 0; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Screens banao (index.html mein kuch likhna nahi padta) ──
  const app = document.getElementById('app');
  const listScreen = document.createElement('div');
  listScreen.className = 'screen';
  listScreen.id = 'screen-utilities';
  listScreen.innerHTML = `
    <div class="app-header">
      <div class="header-back" onclick="goBack()">←</div>
      <div class="header-title">🛠️ Utilities</div>
      <div class="header-spacer"></div>
    </div>
    <div class="scroll-area">
      <div class="search-wrap">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="util-search" placeholder="Search tools... (e.g. EMI, SIP)" autocomplete="off" />
        </div>
      </div>
      <div id="util-list"></div>
    </div>`;
  const calcScreen = document.createElement('div');
  calcScreen.className = 'screen';
  calcScreen.id = 'screen-utilcalc';
  calcScreen.innerHTML = `
    <div class="app-header">
      <div class="header-back" onclick="goBack()">←</div>
      <div class="header-title" id="util-calc-title">Calculator</div>
      <div class="header-spacer"></div>
    </div>
    <div class="scroll-area" id="util-calc-body"></div>`;
  app.appendChild(listScreen);
  app.appendChild(calcScreen);

  // ── Tools ki list dikhana (groups + tiles + search) ──
  function renderList(query) {
    const q = (query || '').trim().toLowerCase();
    const box = document.getElementById('util-list');
    let html = '';
    GROUPS.forEach(g => {
      const items = TOOLS.filter(t => t.group === g.id && (!q || t.name.toLowerCase().includes(q) || g.name.toLowerCase().includes(q)));
      if (!items.length) return; // match na ho to heading bhi chhup jaye
      html += `<div class="util-group-head"><span class="util-group-chip">${g.name}</span></div><div class="util-grid">` +
        items.map(t => `
          <div class="util-tile ${t.live ? '' : 'soon'}" onclick="openUtilityTool('${t.id}')">
            ${t.live ? '' : '<span class="util-soon-badge">Soon</span>'}
            <div class="util-tile-emoji">${t.emoji}</div>
            <div class="util-tile-name">${t.name}</div>
          </div>`).join('') + '</div>';
    });
    if (!html) {
      html = `<div class="empty-wrap"><div class="empty-emoji">😕</div><div class="empty-title">Koi tool nahi mila</div><div class="empty-sub">Doosra naam try karo</div></div>`;
    }
    box.innerHTML = html + '<div style="height:12px"></div>';
  }

  document.getElementById('util-search').addEventListener('input', e => renderList(e.target.value));

  // ── Calculator screen ──
  function readValues(tool) {
    const v = {};
    tool.fields.forEach(f => {
      const el = document.getElementById('util-f-' + f.key);
      v[f.key] = f.type === 'choice' ? el.value : parseFloat(el.value);
    });
    return v;
  }

  function recalc(tool) {
    const v = readValues(tool);
    // labels jo values par depend karte hain (jaise SIP / Lumpsum)
    tool.fields.forEach(f => {
      if (typeof f.label === 'function') {
        document.getElementById('util-l-' + f.key).textContent = f.label(v);
      }
    });
    const out = tool.compute(v);
    const box = document.getElementById('util-results');
    if (!out) {
      box.innerHTML = `<div class="util-note">Upar ke sabhi boxes mein sahi value (0 se zyada) bharo.</div>`;
      return;
    }
    const big = out.find(r => r.big);
    const rest = out.filter(r => !r.big);
    box.innerHTML = `<div class="util-result-card">
      <div class="util-result-big-label">${big.label}</div>
      <div class="util-result-big">${big.value}</div>
      ${rest.map(r => `<div class="util-result-row"><span>${r.label}</span><b>${r.value}</b></div>`).join('')}
    </div>
    <div class="util-note">Ye sirf andaaza ke liye hai. Asli bank/scheme ke hisaab se thoda fark ho sakta hai.</div>`;
  }

  window.openUtilityTool = function (id) {
    const tool = TOOLS.find(t => t.id === id);
    if (!tool) return;
    if (!tool.live) { toast('Coming Soon! 🔜 Stay tuned!', 'info'); return; }

    document.getElementById('util-calc-title').textContent = tool.emoji + ' ' + tool.name;
    const initial = {};
    tool.fields.forEach(f => { initial[f.key] = f.def; });

    const fieldsHTML = tool.fields.map(f => {
      const label = typeof f.label === 'function' ? f.label(initial) : f.label;
      const input = f.type === 'choice'
        ? `<select class="field-select" id="util-f-${f.key}">${f.options.map(o => `<option value="${o}" ${o === f.def ? 'selected' : ''}>${o}</option>`).join('')}</select>`
        : `<input class="field-input" type="number" inputmode="decimal" id="util-f-${f.key}" value="${f.def}" min="0" step="any">`;
      return `<div class="field-group"><label class="field-label" id="util-l-${f.key}">${label}</label>${input}</div>`;
    }).join('');

    document.getElementById('util-calc-body').innerHTML =
      `<div class="util-form">${fieldsHTML}</div><div id="util-results"></div><div style="height:24px"></div>`;

    tool.fields.forEach(f => {
      const el = document.getElementById('util-f-' + f.key);
      el.addEventListener('input', () => recalc(tool));
      el.addEventListener('change', () => recalc(tool));
    });
    recalc(tool);
    showScreen('utilcalc');
    updateNav('');
  };

  // ── Home tab se yahi function call hoga ──
  window.openUtilities = function () {
    document.getElementById('util-search').value = '';
    renderList('');
    showScreen('utilities');
    updateNav('');
  };
})();
