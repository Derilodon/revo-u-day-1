/* ================================================================
   HMIF Badminton Classement – app.js
   ================================================================ */

'use strict';

// ── Constants ──────────────────────────────────────────────────
const STORAGE_KEY   = 'hmif_badminton_v2';
const POINTS_WIN    = 30;
const POINTS_LOSE   = 10;

// Avatar colour palette (cycles through)
const AVATAR_COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#10b981',
  '#f59e0b','#ef4444','#14b8a6','#6366f1',
];

// ── State ──────────────────────────────────────────────────────
let players = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultPlayers();
let nextId  = players.length ? Math.max(...players.map(p => p.id)) + 1 : 1;

function defaultPlayers() {
  return [
    { id:1, nama:'Rizky Pratama',  nim:'22001001', kategori:'Tunggal Putra',  menang:15, kalah:3,  poin:1500 },
    { id:2, nama:'Dina Rahayu',    nim:'22001002', kategori:'Tunggal Putri',  menang:12, kalah:4,  poin:1320 },
    { id:3, nama:'Hendra Wijaya',  nim:'22001003', kategori:'Ganda Putra',    menang:10, kalah:6,  poin:1100 },
    { id:4, nama:'Siti Nurhaliza', nim:'22001004', kategori:'Ganda Putri',    menang:9,  kalah:5,  poin:1050 },
    { id:5, nama:'Budi Santoso',   nim:'22001005', kategori:'Tunggal Putra',  menang:8,  kalah:8,  poin:900  },
    { id:6, nama:'Rina Dewi',      nim:'22001006', kategori:'Ganda Campuran', menang:7,  kalah:5,  poin:860  },
    { id:7, nama:'Fajar Nugroho',  nim:'22001007', kategori:'Ganda Putra',    menang:6,  kalah:7,  poin:780  },
    { id:8, nama:'Mega Sari',      nim:'22001008', kategori:'Tunggal Putri',  menang:5,  kalah:9,  poin:720  },
  ];
}

// ── Persist ────────────────────────────────────────────────────
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

// ── Helpers ────────────────────────────────────────────────────
function winRate(p) {
  const t = p.menang + p.kalah;
  return t === 0 ? 0 : Math.round((p.menang / t) * 100);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase();
}

function avatarColor(id) {
  return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
}

function badgeClass(k) {
  return { 'Tunggal Putra':'badge-tp','Tunggal Putri':'badge-tpi',
           'Ganda Putra':'badge-gp','Ganda Putri':'badge-gpi',
           'Ganda Campuran':'badge-gc' }[k] || '';
}

// ── Filter & Sort ──────────────────────────────────────────────
function getFiltered() {
  const q    = document.getElementById('search').value.toLowerCase();
  const kat  = document.getElementById('filter-kategori').value;
  const sort = document.getElementById('sort-by').value;

  let list = players.filter(p =>
    (p.nama.toLowerCase().includes(q) || p.nim.includes(q)) &&
    (kat === '' || p.kategori === kat)
  );

  list.sort((a, b) => {
    if (sort === 'menang')  return b.menang  - a.menang;
    if (sort === 'winrate') return winRate(b) - winRate(a);
    if (sort === 'nama')    return a.nama.localeCompare(b.nama, 'id');
    return b.poin - a.poin;
  });

  return list;
}

// ── Rank badge HTML ────────────────────────────────────────────
function rankBadgeHtml(rank) {
  if (rank === 1) return `<div class="rank-badge rank-gold">🥇</div>`;
  if (rank === 2) return `<div class="rank-badge rank-silver">🥈</div>`;
  if (rank === 3) return `<div class="rank-badge rank-bronze">🥉</div>`;
  return `<div class="rank-badge rank-other">${rank}</div>`;
}

// ── Win-rate bar HTML ──────────────────────────────────────────
function wrBarHtml(wr) {
  const cls = wr >= 70 ? 'wr-good' : wr >= 50 ? 'wr-ok' : 'wr-bad';
  const tcls = wr >= 70 ? 'wr-good-text' : wr >= 50 ? 'wr-ok-text' : 'wr-bad-text';
  return `
    <div class="wr-wrap">
      <span class="wr-text ${tcls}">${wr}%</span>
      <div class="wr-bar-bg">
        <div class="wr-bar-fill ${cls}" style="width:${wr}%"></div>
      </div>
    </div>`;
}

// ── Row row row your boat ──────────────────────────────────────
function rowHtml(p, rank) {
  const wr     = winRate(p);
  const rowCls = rank <= 3 ? `row-rank-${rank}` : '';
  const color  = avatarColor(p.id);

  return `
  <tr class="player-row ${rowCls}" data-id="${p.id}">
    <td class="center">${rankBadgeHtml(rank)}</td>
    <td>
      <div class="player-cell">
        <div class="avatar" style="background:${color}">${escHtml(initials(p.nama))}</div>
        <div class="player-info">
          <div class="player-name">${escHtml(p.nama)}</div>
          <div class="player-nim">${escHtml(p.nim)}</div>
        </div>
      </div>
    </td>
    <td class="hidden-sm">
      <span class="badge ${badgeClass(p.kategori)}">${escHtml(p.kategori)}</span>
    </td>
    <td class="center" style="color:#64748b;font-weight:600">${p.menang + p.kalah}</td>
    <td class="center" style="color:#16a34a;font-weight:700">${p.menang}</td>
    <td class="center" style="color:#dc2626;font-weight:700">${p.kalah}</td>
    <td class="center hidden-md">${wrBarHtml(wr)}</td>
    <td class="center"><span class="poin-badge">${p.poin.toLocaleString('id')}</span></td>
    <td class="center">
      <div class="action-btns">
        <button class="action-btn btn-match" onclick="openMatchModal(${p.id})" title="Catat Pertandingan" aria-label="Catat pertandingan ${escHtml(p.nama)}">🏸</button>
        <button class="action-btn btn-edit"  onclick="openEdit(${p.id})"       title="Edit Pemain"       aria-label="Edit ${escHtml(p.nama)}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
        </button>
        <button class="action-btn btn-del"   onclick="deletePlayer(${p.id})"   title="Hapus Pemain"      aria-label="Hapus ${escHtml(p.nama)}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </td>
  </tr>`;
}

// ── Render table ───────────────────────────────────────────────
function render() {
  const list  = getFiltered();
  const tbody = document.getElementById('table-body');
  const empty = document.getElementById('empty-state');

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    tbody.innerHTML = list.map((p, i) => rowHtml(p, i + 1)).join('');
  }

  updateStats(list);
}

// ── Stats cards ────────────────────────────────────────────────
function animateCount(el, target) {
  const start    = parseInt(el.textContent) || 0;
  const duration = 600;
  const startTs  = performance.now();

  function step(now) {
    const pct = Math.min((now - startTs) / duration, 1);
    const ease = 1 - Math.pow(1 - pct, 3);
    const val  = Math.round(start + (target - start) * ease);
    el.textContent = val;
    if (pct < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateStats() {
  const total   = players.length;
  const matches = players.reduce((s, p) => s + p.menang + p.kalah, 0);
  const topPlayer = [...players].sort((a,b) => b.poin - a.poin)[0];
  const topName   = topPlayer ? topPlayer.nama.split(' ')[0] : '–';
  const avgWr     = total === 0 ? 0 : Math.round(players.reduce((s,p) => s + winRate(p), 0) / total);

  animateCount(document.getElementById('stat-players'),  total);
  animateCount(document.getElementById('stat-matches'),  matches);
  animateCount(document.getElementById('stat-avg-num'),  avgWr);

  const topEl = document.getElementById('stat-top');
  if (topEl.textContent !== topName) topEl.textContent = topName;
}

// ── Modal Add/Edit ─────────────────────────────────────────────
function openModal(editData = null) {
  const title  = document.getElementById('modal-title');
  const form   = document.getElementById('player-form');
  const overlay = document.getElementById('modal');

  form.reset();
  document.getElementById('edit-id').value = '';

  if (editData) {
    title.textContent = '✏️  Edit Pemain';
    document.getElementById('edit-id').value      = editData.id;
    document.getElementById('f-nama').value       = editData.nama;
    document.getElementById('f-nim').value        = editData.nim;
    document.getElementById('f-kategori').value   = editData.kategori;
    document.getElementById('f-menang').value     = editData.menang;
    document.getElementById('f-kalah').value      = editData.kalah;
    document.getElementById('f-poin').value       = editData.poin;
  } else {
    title.textContent = '➕  Tambah Pemain Baru';
  }

  overlay.classList.add('open');
  setTimeout(() => document.getElementById('f-nama').focus(), 100);
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function openEdit(id) {
  const p = players.find(x => x.id === id);
  if (p) openModal(p);
}

function submitForm(e) {
  e.preventDefault();
  const editId = document.getElementById('edit-id').value;
  const data = {
    nama:     document.getElementById('f-nama').value.trim(),
    nim:      document.getElementById('f-nim').value.trim(),
    kategori: document.getElementById('f-kategori').value,
    menang:   Math.max(0, parseInt(document.getElementById('f-menang').value) || 0),
    kalah:    Math.max(0, parseInt(document.getElementById('f-kalah').value)  || 0),
    poin:     Math.max(0, parseInt(document.getElementById('f-poin').value)   || 0),
  };

  if (editId) {
    const idx = players.findIndex(p => p.id === parseInt(editId));
    if (idx !== -1) players[idx] = { ...players[idx], ...data };
    showToast('💾', 'Data pemain diperbarui!');
  } else {
    players.push({ id: nextId++, ...data });
    showToast('✅', `${data.nama} ditambahkan!`);
  }

  save(); render(); closeModal();
}

// ── Delete ──────────────────────────────────────────────────────
function deletePlayer(id) {
  const p = players.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Hapus pemain "${p.nama}"?\n\nData tidak bisa dikembalikan.`)) return;
  players = players.filter(x => x.id !== id);
  save(); render();
  showToast('🗑️', 'Pemain dihapus.');
}

// ── Match modal ────────────────────────────────────────────────
function openMatchModal(id) {
  const p = players.find(x => x.id === id);
  if (!p) return;
  document.getElementById('match-player-id').value       = id;
  document.getElementById('match-player-name').textContent = p.nama;
  document.getElementById('match-modal').classList.add('open');
}

function closeMatchModal() {
  document.getElementById('match-modal').classList.remove('open');
}

function recordMatch(win) {
  const id = parseInt(document.getElementById('match-player-id').value);
  const p  = players.find(x => x.id === id);
  if (!p) return;

  if (win) {
    p.menang += 1;
    p.poin   += POINTS_WIN;
    showToast('🏆', `+${POINTS_WIN} poin — ${p.nama} menang!`);
  } else {
    p.kalah  += 1;
    p.poin    = Math.max(0, p.poin - POINTS_LOSE);
    showToast('💪', `-${POINTS_LOSE} poin — terus semangat!`);
  }

  save(); render(); closeMatchModal();
}

// ── Toast ───────────────────────────────────────────────────────
let toastTimer = null;
function showToast(icon, msg) {
  const el  = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent  = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeMatchModal(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('search').focus();
  }
});

// ── Close on backdrop click ────────────────────────────────────
['modal','match-modal'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) {
      id === 'modal' ? closeModal() : closeMatchModal();
    }
  });
});

// ── Search / filter / sort listeners ──────────────────────────
document.getElementById('search').addEventListener('input', render);
document.getElementById('filter-kategori').addEventListener('change', render);
document.getElementById('sort-by').addEventListener('change', render);

// ── Init ───────────────────────────────────────────────────────
render();
