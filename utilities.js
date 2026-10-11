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
  const pctFmt = n => (isFinite(n) ? n.toFixed(2) + '%' : '—');
  const num0 = x => (isFinite(x) ? x : 0);
  const row = (label, value) => ({ label, value });

  const FREQ = { 'Annually': 1, 'Semi-annually': 2, 'Quarterly': 4, 'Monthly': 12, 'Daily': 365 };
  const FREQ_LIST = Object.keys(FREQ);

  // ── Common formulas ──
  function emiOf(P, ratePct, months) {
    const r = ratePct / 1200;
    if (r === 0) return P / months;
    const g = Math.pow(1 + r, months);
    return (P * r * g) / (g - 1);
  }
  function loanResult(P, ratePct, months) {
    if (!(P > 0) || !(months > 0) || !(ratePct >= 0)) return null;
    const emi = emiOf(P, ratePct, months);
    const total = emi * months;
    return {
      cards: [{
        big: row('Monthly EMI', rupee(emi)),
        rows: [row('Principal Amount', rupee(P)), row('Total Interest', rupee(total - P)), row('Total Payable Amount', rupee(total))]
      }]
    };
  }
  function growth(P, ratePct, T, freqName) {
    const f = FREQ[freqName] || 1;
    return P * Math.pow(1 + ratePct / 100 / f, f * T);
  }

  // ── Table / details / chart helpers ──
  function tableHTML(heads, rows) {
    return `<div class="util-table-wrap"><table class="util-table"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>` +
      rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') + '</tbody></table></div>';
  }
  function detailsHTML(title, inner) {
    return `<details class="util-details"><summary>${title}</summary>${inner}</details>`;
  }
  function donutSVG(prin, intr) {
    const total = prin + intr, C = 2 * Math.PI * 40, p = total > 0 ? prin / total : 1;
    return `<svg viewBox="0 0 120 120" width="120" height="120" style="flex-shrink:0">
      <circle cx="60" cy="60" r="40" fill="none" stroke="#F59E0B" stroke-width="18"/>
      <circle cx="60" cy="60" r="40" fill="none" stroke="#3B82F6" stroke-width="18" stroke-dasharray="${(p * C).toFixed(2)} ${C.toFixed(2)}" transform="rotate(-90 60 60)"/>
      <text x="60" y="65" text-anchor="middle" style="font-size:14px;font-weight:800;fill:var(--text)">${Math.round((1 - p) * 100)}%</text></svg>`;
  }
  function lineSVG(vals) {
    const W = 320, H = 150, L = 6, R = 6, T = 10, B = 22, n = vals.length - 1, max = Math.max.apply(null, vals) || 1;
    const x = i => L + (n ? i / n : 0) * (W - L - R), y = v => T + (1 - v / max) * (H - T - B);
    const pts = vals.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1));
    const area = 'M' + pts.join(' L') + ` L${x(n).toFixed(1)},${H - B} L${x(0).toFixed(1)},${H - B} Z`;
    const lab = 'style="font-size:10px;fill:var(--muted)"';
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">
      <path d="${area}" fill="rgba(59,130,246,0.15)"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="var(--border)"/>
      <text x="${L}" y="${H - 6}" ${lab}>Year 0</text>
      <text x="${W / 2}" y="${H - 6}" text-anchor="middle" ${lab}>Year ${Math.round(n / 2)}</text>
      <text x="${W - R}" y="${H - 6}" text-anchor="end" ${lab}>Year ${n}</text></svg>`;
  }
  function barsSVG(rows) {
    const W = 320, H = 150, L = 6, R = 6, T = 8, B = 22, n = rows.length;
    const max = Math.max.apply(null, rows.map(r => r.principal + r.interest)) || 1;
    const bw = (W - L - R) / n, ph = H - T - B, lab = 'style="font-size:10px;fill:var(--muted)"';
    let bars = '';
    rows.forEach((r, i) => {
      const hp = (r.principal / max) * ph, hi = (r.interest / max) * ph, x = L + i * bw + bw * 0.15, w = bw * 0.7;
      bars += `<rect x="${x.toFixed(1)}" y="${(H - B - hp).toFixed(1)}" width="${w.toFixed(1)}" height="${hp.toFixed(1)}" fill="#3B82F6"/>` +
              `<rect x="${x.toFixed(1)}" y="${(H - B - hp - hi).toFixed(1)}" width="${w.toFixed(1)}" height="${hi.toFixed(1)}" fill="#F59E0B"/>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${bars}
      <line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="var(--border)"/>
      <text x="${L}" y="${H - 6}" ${lab}>Year 1</text>
      <text x="${W - R}" y="${H - 6}" text-anchor="end" ${lab}>Year ${n}</text></svg>`;
  }
  const chartBox = (title, inner, legend) =>
    `<div class="util-chart-box"><div class="util-chart-title">${title}</div>${inner}${legend || ''}</div>`;
  const legendHTML = items => `<div class="util-legend">${items.map(i => `<span><i style="background:${i[0]}"></i>${i[1]}</span>`).join('')}</div>`;

  // ── Home loan schedule (Excel jaisa: prepayment 2nd saal ke end se har saal) ──
  function schedule(P, ratePct, years, prepayEMIs) {
    const n = Math.round(years * 12), r = ratePct / 1200, emi = emiOf(P, ratePct, n);
    let bal = P, ti = 0;
    const rows = [];
    for (let m = 1; m <= n && bal > 0.5; m++) {
      const interest = bal * r;
      let principal = emi - interest;
      if (principal > bal) principal = bal;
      bal -= principal;
      let prepay = 0;
      if (prepayEMIs > 0 && m % 12 === 0 && m >= 24 && bal > 0.5) { prepay = Math.min(bal, emi * prepayEMIs); bal -= prepay; }
      ti += interest;
      rows.push({ m, emi: principal + interest, principal, interest, prepay, bal: Math.max(bal, 0) });
    }
    return { emi, rows, totalInterest: ti };
  }
  const monthsText = m => `${Math.floor(m / 12)} yrs ${m % 12} months`;

  // ── Groups (screen par ye order dikhega) ──
  const GROUPS = [
    { id: 'loan',     name: '🏦 Loan & EMI' },
    { id: 'invest',   name: '📈 Investment' },
    { id: 'interest', name: '🧮 Interest & Returns' },
    { id: 'tax',      name: '🧾 Tax & Salary' }
  ];

  // ── TOOLS ──
  const TOOLS = [
    // ───────── Loan & EMI ─────────
    {
      id: 'home-loan', group: 'loan', emoji: '🏠', name: 'Home Loan', live: true,
      fields: [
        { key: 'amount', label: 'Loan Amount (₹)', def: 3000000 },
        { key: 'rate',   label: 'Interest Rate (% per year)', def: 8, half: true },
        { key: 'years',  label: 'Tenure (Years)', def: 20, half: true },
        { key: 'prepay', label: 'Prepayment per year (in number of EMIs)', def: 0 }
      ],
      notes: ['Prepayment is applied at the end of every year starting from the 2nd year (same as the Excel sheet). Keep 0 for no prepayment.'],
      compute: v => {
        if (!(v.amount > 0) || !(v.years >= 1 / 12) || !(v.rate >= 0)) return null;
        const pre = num0(v.prepay) > 0 ? num0(v.prepay) : 0;
        const s = schedule(v.amount, v.rate, v.years, pre);
        const base = pre > 0 ? schedule(v.amount, v.rate, v.years, 0) : s;
        const paidInterest = s.totalInterest;
        const rowsA = [row('Total Interest', rupee(paidInterest)), row('Total Payment (principal + interest)', rupee(v.amount + paidInterest)),
                       row('Loan paid off in', monthsText(s.rows.length))];
        if (pre > 0) {
          rowsA.push(row('Interest Saved', rupee(base.totalInterest - paidInterest)));
          rowsA.push(row('Loan Closed Earlier By', monthsText(base.rows.length - s.rows.length)));
        }
        // saal-dar-saal
        const years = [];
        s.rows.forEach(r => {
          const y = Math.ceil(r.m / 12);
          if (!years[y - 1]) years[y - 1] = { year: y, principal: 0, interest: 0, bal: 0 };
          years[y - 1].principal += r.principal + r.prepay;
          years[y - 1].interest += r.interest;
          years[y - 1].bal = r.bal;
        });
        const balVals = [v.amount].concat(years.map(y => y.bal));
        const html =
          chartBox('Principal vs Interest',
            `<div style="display:flex;align-items:center;gap:16px">${donutSVG(v.amount, paidInterest)}<div>` +
            legendHTML([['#3B82F6', 'Principal ' + rupee(v.amount)], ['#F59E0B', 'Interest ' + rupee(paidInterest)]]).replace('util-legend', 'util-legend col') + '</div></div>') +
          chartBox('Outstanding Balance (year by year)', lineSVG(balVals)) +
          chartBox('Principal and Interest paid each year', barsSVG(years),
            legendHTML([['#3B82F6', 'Principal'], ['#F59E0B', 'Interest']])) +
          detailsHTML('📅 Year-wise table',
            tableHTML(['Year', 'Principal', 'Interest', 'Balance'], years.map(y => [y.year, fmt(y.principal), fmt(y.interest), fmt(y.bal)]))) +
          detailsHTML('🗓️ Month-wise table',
            tableHTML(['Month', 'EMI', 'Principal', 'Interest', 'Prepay', 'Balance'],
              s.rows.map(r => [r.m, fmt(r.emi), fmt(r.principal), fmt(r.interest), r.prepay ? fmt(r.prepay) : '–', fmt(r.bal)])));
        return { cards: [{ big: row('Monthly EMI', rupee(s.emi)), rows: rowsA }], html };
      }
    },
    {
      id: 'emi', group: 'loan', emoji: '💳', name: 'EMI Calculator', live: true,
      fields: [
        { key: 'amount', label: 'Loan Amount (₹)', def: 1100000 },
        { key: 'years',  label: 'Tenure (Years)', def: 3, half: true },
        { key: 'rate',   label: 'Interest Rate (% per year)', def: 9, half: true }
      ],
      compute: v => loanResult(v.amount, v.rate, v.years * 12)
    },
    {
      id: 'car-loan', group: 'loan', emoji: '🚗', name: 'Car Loan EMI', live: true,
      fields: [
        { key: 'amount', label: 'Loan Amount (₹)', def: 1055000 },
        { key: 'rate',   label: 'Interest Rate (% per year)', def: 6.5, half: true },
        { key: 'years',  label: 'Time Period (Years)', def: 5, half: true }
      ],
      compute: v => loanResult(v.amount, v.rate, v.years * 12)
    },
    {
      id: 'personal-loan', group: 'loan', emoji: '👤', name: 'Personal Loan EMI', live: true,
      fields: [
        { key: 'amount', label: 'Loan Amount (₹)', def: 1320890 },
        { key: 'rate',   label: 'Interest Rate (% per year)', def: 14.25 },
        { key: 'dtype',  label: 'Duration Type', type: 'choice', options: ['Months', 'Years'], def: 'Months', half: true },
        { key: 'dur',    label: 'Duration of Loan', def: 18, half: true }
      ],
      compute: v => loanResult(v.amount, v.rate, v.dtype === 'Years' ? v.dur * 12 : v.dur)
    },
    {
      id: 'down-payment', group: 'loan', emoji: '🏡', name: 'Down Payment', live: true,
      fields: [
        { key: 'cost',  label: 'Total Cost of Asset (₹)', def: 1000000 },
        { key: 'dp',    label: 'Down Payment (%)', def: 15, half: true },
        { key: 'rate',  label: 'Interest Rate (% per year)', def: 13.6, half: true },
        { key: 'pf',    label: 'Processing Fee (% of loan)', def: 3, half: true },
        { key: 'years', label: 'Loan Tenure (Years)', def: 10, half: true }
      ],
      compute: v => {
        if (!(v.cost > 0) || !(v.dp >= 0 && v.dp < 100) || !(v.years > 0) || !(v.rate >= 0) || !(num0(v.pf) >= 0)) return null;
        const dp = v.cost * v.dp / 100, loan = v.cost - dp, fee = loan * num0(v.pf) / 100;
        const emi = loan > 0 ? emiOf(loan, v.rate, v.years * 12) : 0;
        return {
          cards: [{
            big: row('Cash Needed (Down Payment + Fee)', rupee(dp + fee)),
            rows: [row('Down Payment', rupee(dp)), row('Loan Amount', rupee(loan)), row('Processing Fee', rupee(fee)), row('Monthly Payment (EMI)', rupee(emi))]
          }]
        };
      }
    },
    {
      id: 'flat-reducing', group: 'loan', emoji: '⚖️', name: 'Flat vs Reducing', live: true,
      fields: [
        { key: 'amount', label: 'Loan Amount (₹)', def: 1200000 },
        { key: 'rate',   label: 'Interest Rate (% per year)', def: 11.5, half: true },
        { key: 'years',  label: 'Loan Tenure (Years)', def: 10, half: true }
      ],
      compute: v => {
        if (!(v.amount > 0) || !(v.years > 0) || !(v.rate >= 0)) return null;
        const n = v.years * 12;
        const flatInt = v.amount * v.rate / 100 * v.years, flatTotal = v.amount + flatInt, flatEmi = flatTotal / n;
        const redEmi = emiOf(v.amount, v.rate, n), redTotal = redEmi * n, redInt = redTotal - v.amount;
        return {
          cards: [
            { title: 'Flat Rate', big: row('Monthly EMI', rupee(flatEmi)), rows: [row('Total Interest', rupee(flatInt)), row('Total Amount', rupee(flatTotal))] },
            { title: 'Reducing Balance', big: row('Monthly EMI', rupee(redEmi)), rows: [row('Total Interest', rupee(redInt)), row('Total Amount', rupee(redTotal))] }
          ],
          notes: [`With a flat rate you pay ${rupee(flatInt - redInt)} more interest than with a reducing balance rate. Always check whether a loan quotes a flat or a reducing rate.`]
        };
      }
    },

    // ───────── Investment ─────────
    {
      id: 'sip', group: 'invest', emoji: '📈', name: 'SIP Calculator', live: true,
      fields: [
        { key: 'mode', label: 'Investment Type', type: 'choice', options: ['SIP', 'Lumpsum'], def: 'SIP' },
        { key: 'amount', label: v => (v.mode === 'SIP' ? 'Monthly Investment (₹)' : 'Investment Amount (₹)'), def: 40000 },
        { key: 'rate',   label: 'Expected Return (% per year)', def: 18, half: true },
        { key: 'years',  label: 'Time Period (Years)', def: 5, half: true }
      ],
      notes: ['Returns are not guaranteed. Actual mutual fund returns go up and down with the market.'],
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
        return { cards: [{ big: row('Total Value', rupee(value)), rows: [row('Invested Amount', rupee(invested)), row('Estimated Returns', rupee(value - invested))] }] };
      }
    },
    {
      id: 'ppf', group: 'invest', emoji: '🏦', name: 'PPF Calculator', live: true,
      fields: [
        { key: 'freq',   label: 'Frequency of Investment', type: 'choice', options: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'], def: 'Monthly' },
        { key: 'amount', label: v => `PPF Investment (${v.freq}) (₹)`, def: 12500 },
        { key: 'rate',   label: 'PPF Interest Rate (% per year)', def: 7.1, half: true },
        { key: 'years',  label: 'Duration (Years)', def: 25, half: true }
      ],
      compute: v => {
        const mult = { 'Monthly': 12, 'Quarterly': 4, 'Half Yearly': 2, 'Yearly': 1 }[v.freq] || 1;
        if (!(v.amount > 0) || !(v.years > 0) || !(v.rate >= 0)) return null;
        const Y = v.amount * mult, r = v.rate / 100, n = v.years;
        const maturity = r === 0 ? Y * n : Y * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const notes = [];
        if (Y > 150000) notes.push('⚠️ A maximum of ₹1.5 lakh can be deposited in PPF in a year. Your yearly amount is higher.');
        if (v.years < 15) notes.push('⚠️ PPF has a lock-in period of 15 years.');
        return {
          cards: [{ big: row('PPF Maturity Amount', rupee(maturity)), rows: [row('Total Deposits', rupee(Y * n)), row('Total Interest', rupee(maturity - Y * n))] }],
          notes
        };
      },
      notes: ['The default rate of 7.1% is the rate notified for the Oct-Dec 2026 quarter. The government reviews it every quarter, so you can enter the current rate yourself.',
              'This estimate assumes deposits are made at the start of each year. Actual PPF interest is calculated monthly, so the real figure may differ slightly.']
    },
    { id: 'nps', group: 'invest', emoji: '👴', name: 'NPS Calculator', live: false },
    {
      id: 'fd', group: 'invest', emoji: '💰', name: 'FD Interest', live: true,
      fields: [
        { key: 'amount', label: 'Deposit Amount (₹)', def: 1500000 },
        { key: 'years',  label: 'Years', def: 0, half: true },
        { key: 'months', label: 'Months', def: 0, half: true },
        { key: 'days',   label: 'Days', def: 400 },
        { key: 'comp',   label: 'Compounding', type: 'choice', options: FREQ_LIST, def: 'Quarterly', half: true },
        { key: 'rate',   label: 'Interest Rate (% per year)', def: 7.5, half: true }
      ],
      notes: ['Banks apply compounding and day-count as per their own scheme, so the actual maturity amount may differ slightly. Tax/TDS on FD interest is not included.'],
      compute: v => {
        const T = num0(v.years) + num0(v.months) / 12 + num0(v.days) / 365;
        if (!(v.amount > 0) || !(T > 0) || !(v.rate >= 0)) return null;
        const fv = growth(v.amount, v.rate, T, v.comp);
        return { cards: [{ big: row('Total Maturity Amount', rupee(fv)), rows: [row('Deposit Amount', rupee(v.amount)), row('Total Interest Amount', rupee(fv - v.amount))] }] };
      }
    },

    // ───────── Interest & Returns ─────────
    {
      id: 'simple-int', group: 'interest', emoji: '➕', name: 'Simple Interest', live: true,
      fields: [
        { key: 'p', label: 'Principal Amount (₹)', def: 123000 },
        { key: 'rate', label: 'Rate of Interest (% per year)', def: 7.5, half: true },
        { key: 'years', label: 'Time Period (Years)', def: 20, half: true }
      ],
      compute: v => {
        if (!(v.p > 0) || !(v.years > 0) || !(v.rate >= 0)) return null;
        const si = v.p * v.rate / 100 * v.years;
        return { cards: [{ big: row('Total Amount', rupee(v.p + si)), rows: [row('Principal Amount', rupee(v.p)), row('Total Interest', rupee(si))] }] };
      }
    },
    {
      id: 'compound-int', group: 'interest', emoji: '📊', name: 'Compound Interest', live: true,
      fields: [
        { key: 'p',      label: 'Deposit Amount (₹)', def: 300000 },
        { key: 'years',  label: 'Years', def: 2, half: true },
        { key: 'months', label: 'Months', def: 6, half: true },
        { key: 'comp',   label: 'Compounding', type: 'choice', options: FREQ_LIST, def: 'Annually', half: true },
        { key: 'rate',   label: 'Interest Rate (% per year)', def: 15, half: true }
      ],
      compute: v => {
        const T = num0(v.years) + num0(v.months) / 12;
        if (!(v.p > 0) || !(T > 0) || !(v.rate >= 0)) return null;
        const fv = growth(v.p, v.rate, T, v.comp);
        const trs = [];
        for (let y = 1; y <= Math.min(Math.floor(T), 60); y++) trs.push([y, fmt(growth(v.p, v.rate, y, v.comp))]);
        if (T !== Math.floor(T) && T <= 60) trs.push([T.toFixed(2).replace(/\.?0+$/, ''), fmt(fv)]);
        return {
          cards: [{ big: row('Total Maturity Amount', rupee(fv)), rows: [row('Deposit Amount', rupee(v.p)), row('Total Interest Amount', rupee(fv - v.p))] }],
          html: detailsHTML('📅 Year-wise growth', tableHTML(['Year', 'Amount (₹)'], trs))
        };
      }
    },
    {
      id: 'cagr', group: 'interest', emoji: '🚀', name: 'CAGR', live: true,
      fields: [
        { key: 'start', label: 'Initial Value (₹)', def: 8600 },
        { key: 'end',   label: 'Final Value (₹)', def: 10000 },
        { key: 'years', label: 'Investment Period (Years)', def: 4 }
      ],
      compute: v => {
        if (!(v.start > 0) || !(v.end > 0) || !(v.years > 0)) return null;
        const c = (Math.pow(v.end / v.start, 1 / v.years) - 1) * 100;
        return { cards: [{ big: row('Compounded Annual Growth Rate (CAGR)', pctFmt(c)), rows: [row('Total Growth', pctFmt((v.end / v.start - 1) * 100)), row('Total Gain', rupee(v.end - v.start))] }] };
      }
    },
    {
      id: 'roi', group: 'interest', emoji: '🎯', name: 'ROI', live: true,
      fields: [
        { key: 'inv',   label: 'Amount Invested (₹)', def: 5000 },
        { key: 'ret',   label: 'Amount Returned (₹)', def: 6000 },
        { key: 'years', label: 'Investment Period (Years)', def: 2 }
      ],
      compute: v => {
        if (!(v.inv > 0) || !(v.ret >= 0) || !(v.years > 0)) return null;
        const gain = v.ret - v.inv, roi = gain / v.inv * 100;
        return {
          cards: [{
            big: row('Return on Investment (ROI)', pctFmt(roi)),
            rows: [row('Total Gain on Investment', rupee(gain)), row('Simple Annual ROI', pctFmt(roi / v.years)),
                   row('CAGR', v.ret > 0 ? pctFmt((Math.pow(v.ret / v.inv, 1 / v.years) - 1) * 100) : '—')]
          }]
        };
      }
    },

    // ───────── Tax & Salary ─────────
    {
      id: 'cap-gains', group: 'tax', emoji: '🧾', name: 'Capital Gains', live: true,
      fields: [
        { key: 'hold', label: 'Holding Period', type: 'choice', options: ['More than 12 months', '12 months or less'], def: 'More than 12 months' },
        { key: 'bought', label: 'When was it purchased?', type: 'choice', options: ['After 31 Jan 2018', 'On or before 31 Jan 2018'], def: 'After 31 Jan 2018' },
        { key: 'sale', label: 'Sale Value (₹)', def: 1565000, half: true },
        { key: 'buy',  label: 'Purchase Value (₹)', def: 855923, half: true },
        { key: 'fmv',  label: 'FMV on 31 Jan 2018 (₹) (only if purchased on or before 31 Jan 2018)', def: 0 }
      ],
      notes: [
        'This applies only to listed equity shares and equity mutual funds (STT paid), at the rates applicable to sales after 23 July 2024.',
        'Long-term (held more than 12 months) gains are taxed at 12.5% only on the amount above ₹1.25 lakh. Short-term gains are taxed at 20%. 4% cess is added on both.',
        'The ₹1.25 lakh exemption is available once per year across all long-term equity gains.',
        'Brokerage, STT and similar expenses are not included. Confirm the final tax calculation with a CA.'
      ],
      compute: v => {
        if (!(v.sale >= 0) || !(v.buy >= 0)) return null;
        const longTerm = v.hold === 'More than 12 months';
        let cost = v.buy;
        if (longTerm && v.bought === 'On or before 31 Jan 2018') cost = Math.max(v.buy, Math.min(num0(v.fmv), v.sale));
        const gain = v.sale - cost;
        if (gain <= 0) {
          return { cards: [{ big: row('Tax Payable', rupee(0)), rows: [row('Capital Gain / (Loss)', (gain < 0 ? '− ' : '') + rupee(Math.abs(gain)))] }],
                   notes: gain < 0 ? ['There is a loss, so no tax is payable. The loss can be set off or carried forward as per the rules.'] : [] };
        }
        if (longTerm) {
          const exempt = Math.min(gain, 125000), taxable = gain - exempt, tax = taxable * 0.125, cess = tax * 0.04;
          return { cards: [{ big: row('Total Tax (including cess)', rupee(tax + cess)),
            rows: [row('Long Term Capital Gain', rupee(gain)), row('Exemption (max ₹1.25 lakh)', rupee(exempt)), row('Taxable LTCG', rupee(taxable)),
                   row('Tax @ 12.5%', rupee(tax)), row('Cess @ 4%', rupee(cess)), row('Gain after tax', rupee(gain - tax - cess))] }] };
        }
        const tax = gain * 0.20, cess = tax * 0.04;
        return { cards: [{ big: row('Total Tax (including cess)', rupee(tax + cess)),
          rows: [row('Short Term Capital Gain', rupee(gain)), row('Tax @ 20%', rupee(tax)), row('Cess @ 4%', rupee(cess)), row('Gain after tax', rupee(gain - tax - cess))] }] };
      }
    },
    {
      id: 'gratuity', group: 'tax', emoji: '🎁', name: 'Gratuity', live: true,
      fields: [
        { key: 'emp',    label: 'Employer Type', type: 'choice', options: ['Private (covered by Gratuity Act)', 'Government'], def: 'Private (covered by Gratuity Act)' },
        { key: 'wage',   label: 'Monthly Salary (Basic + DA) (₹)', def: 120000 },
        { key: 'years',  label: 'Years of Service', def: 15, half: true },
        { key: 'months', label: 'Extra Months', def: 0, half: true }
      ],
      notes: [
        'Formula: 15 × last drawn salary × years of service ÷ 26. More than 6 months is counted as a full year.',
        'For private employees the tax-free limit is ₹20 lakh, a lifetime limit across all employers. Government employees get a full exemption.',
        'Under the new labour codes, "wages" (Basic + DA) must be at least 50% of CTC. Fixed-term employees get pro-rata gratuity after 1 year.'
      ],
      compute: v => {
        if (!(v.wage > 0) || !(num0(v.years) >= 0) || !(num0(v.months) >= 0)) return null;
        const yrs = num0(v.years) + (num0(v.months) > 6 ? 1 : 0) + (num0(v.months) > 12 ? Math.floor(num0(v.months) / 12) - 1 : 0);
        if (!(yrs > 0)) return null;
        const g = 15 * v.wage * yrs / 26;
        const govt = v.emp === 'Government';
        const free = govt ? g : Math.min(g, 2000000);
        return { cards: [{ big: row('Total Gratuity Payable', rupee(g)),
          rows: [row('Years counted', String(yrs)), row('Tax-free hissa', rupee(free)), row('Taxable hissa', rupee(g - free))] }] };
      }
    },
    {
      id: 'ctc', group: 'tax', emoji: '💼', name: 'CTC Calculator', live: true,
      fields: [
        { key: 'ctc',   label: 'Cost to Company (CTC) per year (₹)', def: 500000 },
        { key: 'btype', label: 'Bonus included in CTC as', type: 'choice', options: ['Percentage', 'Amount'], def: 'Percentage', half: true },
        { key: 'bval',  label: v => (v.btype === 'Percentage' ? 'Bonus (%)' : 'Bonus (₹)'), def: 10, half: true },
        { key: 'pt',    label: 'Professional Tax / month', def: 200, half: true },
        { key: 'epf',   label: 'Employee PF / month', def: 500, half: true },
        { key: 'erpf',  label: 'Employer PF / month', def: 100, half: true },
        { key: 'ins',   label: 'Employee Insurance / month', def: 150, half: true },
        { key: 'a1',    label: 'Extra Deduction 1', def: 100, half: true },
        { key: 'a2',    label: 'Extra Deduction 2', def: 100, half: true },
        { key: 'a3',    label: 'Extra Deduction 3', def: 100, half: true },
        { key: 'a4',    label: 'Extra Deduction 4', def: 100, half: true }
      ],
      notes: ['This take-home is before income tax (TDS); only the deductions listed above are subtracted. Actual in-hand salary will be lower after tax.'],
      compute: v => {
        if (!(v.ctc > 0)) return null;
        const bonus = v.btype === 'Percentage' ? v.ctc * num0(v.bval) / 100 : num0(v.bval);
        const grossYear = v.ctc - bonus, grossMonth = grossYear / 12;
        const ded = ['pt', 'epf', 'erpf', 'ins', 'a1', 'a2', 'a3', 'a4'].reduce((s, k) => s + num0(v[k]), 0);
        const netMonth = grossMonth - ded;
        return { cards: [{ big: row('Net Take Home (monthly)', rupee(netMonth)),
          rows: [row('Performance Bonus (yearly)', rupee(bonus)), row('Total Gross Pay (yearly)', rupee(grossYear)), row('Gross Pay (monthly)', rupee(grossMonth)),
                 row('Total Monthly Deductions', rupee(ded)), row('Total Annual Deductions', rupee(ded * 12)), row('Net Take Home (annual)', rupee(netMonth * 12))] }] };
      }
    }
  ];

  // Debug / future use
  window.UTIL_TOOLS = TOOLS;

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
  .util-form { padding: 16px 16px 0; display:grid; grid-template-columns: 1fr 1fr; column-gap: 12px; }
  .util-form .field-group { grid-column: 1 / -1; min-width: 0; }
  .util-form .field-group.util-half { grid-column: auto; }
  .util-form .field-label { text-transform: none; letter-spacing: 0.2px; font-size: 11.5px; }
  .util-result-card { margin: 16px; background: linear-gradient(135deg,#1E3A8A,#2563EB 55%,#4F46E5);
    border-radius: 20px; padding: 18px 20px; color:#fff; box-shadow: 0 8px 24px rgba(37,99,235,.25); }
  .util-result-card.alt { background: linear-gradient(135deg,#065F46,#059669 55%,#10B981); box-shadow: 0 8px 24px rgba(5,150,105,.25); }
  .util-result-title { font-size: 12px; font-weight: 800; letter-spacing: .3px; opacity: .9; margin-bottom: 6px; }
  .util-result-big-label { font-size: 12px; font-weight:600; color:#DBEAFE; }
  .util-result-big { font-family: var(--font-head); font-size: 30px; font-weight: 800; margin: 2px 0 12px; word-break: break-word; }
  .util-result-row { display:flex; justify-content:space-between; gap:10px; padding: 9px 0; border-top:1px solid rgba(255,255,255,.2); font-size: 13px; }
  .util-result-row b { font-weight: 800; text-align:right; }
  .util-note { margin: 0 16px 16px; font-size: 11.5px; color: var(--muted); line-height:1.55; }
  .util-note div { margin-bottom: 5px; }
  .util-chart-box { margin: 0 16px 12px; background: var(--white); border:1px solid var(--border); border-radius:16px; padding: 14px; box-shadow: var(--shadow); }
  .util-chart-title { font-size: 12.5px; font-weight: 800; color: var(--text); margin-bottom: 10px; }
  .util-legend { display:flex; gap:14px; flex-wrap:wrap; font-size: 11.5px; color: var(--text); margin-top: 8px; }
  .util-legend.col { flex-direction: column; gap: 6px; margin-top: 0; }
  .util-legend i { display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:6px; }
  .util-details { margin: 0 16px 12px; background: var(--white); border:1px solid var(--border); border-radius:14px; padding: 12px 14px; box-shadow: var(--shadow); }
  .util-details summary { font-size: 13px; font-weight: 700; color: var(--text); cursor: pointer; }
  .util-table-wrap { overflow-x:auto; margin-top: 10px; max-height: 360px; overflow-y:auto; }
  .util-table { width:100%; border-collapse: collapse; font-size: 11.5px; color: var(--text); }
  .util-table th { position: sticky; top: 0; background: var(--bg2); text-align:right; padding: 7px 8px; font-weight:800; white-space:nowrap; }
  .util-table td { text-align:right; padding: 6px 8px; border-bottom:1px solid var(--border); white-space:nowrap; }
  .util-table th:first-child, .util-table td:first-child { text-align:left; }
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
      html = `<div class="empty-wrap"><div class="empty-emoji">😕</div><div class="empty-title">No tool found</div><div class="empty-sub">Try a different name</div></div>`;
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

  function renderResult(out, tool) {
    let html = '';
    out.cards.forEach((c, i) => {
      html += `<div class="util-result-card ${i % 2 ? 'alt' : ''}">` +
        (c.title ? `<div class="util-result-title">${c.title}</div>` : '') +
        `<div class="util-result-big-label">${c.big.label}</div><div class="util-result-big">${c.big.value}</div>` +
        c.rows.map(r => `<div class="util-result-row"><span>${r.label}</span><b>${r.value}</b></div>`).join('') + '</div>';
    });
    html += out.html || '';
    const notes = (out.notes || []).concat(tool.notes || []);
    notes.push('This is only an estimate. Actual figures may differ slightly depending on the bank or scheme.');
    html += `<div class="util-note">${notes.map(n => `<div>• ${n}</div>`).join('')}</div>`;
    return html;
  }

  function recalc(tool) {
    const v = readValues(tool);
    // labels jo values par depend karte hain (jaise SIP / Lumpsum)
    tool.fields.forEach(f => {
      if (typeof f.label === 'function') {
        document.getElementById('util-l-' + f.key).textContent = f.label(v);
      }
    });
    const box = document.getElementById('util-results');
    const openStates = Array.prototype.map.call(box.querySelectorAll('details'), d => d.open);
    const out = tool.compute(v);
    if (!out) {
      box.innerHTML = `<div class="util-note">Please enter valid values in all the boxes above.</div>`;
      return;
    }
    box.innerHTML = renderResult(out, tool);
    box.querySelectorAll('details').forEach((d, i) => { if (openStates[i]) d.open = true; });
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
      return `<div class="field-group ${f.half ? 'util-half' : ''}"><label class="field-label" id="util-l-${f.key}">${label}</label>${input}</div>`;
    }).join('');

    document.getElementById('util-calc-body').innerHTML =
      `<div class="util-form">${fieldsHTML}</div><div id="util-results"></div><div style="height:24px"></div>`;

    let timer = null;
    tool.fields.forEach(f => {
      const el = document.getElementById('util-f-' + f.key);
      el.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => recalc(tool), 120); });
      el.addEventListener('change', () => { clearTimeout(timer); recalc(tool); });
    });
    recalc(tool);
    showScreen('utilcalc');
    updateNav('');
    const sc = document.getElementById('util-calc-body');
    if (sc) sc.scrollTop = 0;
  };

  // ── Home tab se yahi function call hoga ──
  window.openUtilities = function () {
    document.getElementById('util-search').value = '';
    renderList('');
    showScreen('utilities');
    updateNav('');
  };
})();
