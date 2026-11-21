// Takt: App-Logik. Alle Daten bleiben auf dem Gerät (localStorage, Fotos in IndexedDB).
"use strict";

// ---------- Hilfen ----------
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const today = () => ymd(new Date());
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const monday = s => { const d = parse(s); return addDays(s, -((d.getDay() + 6) % 7)); };
const DOW = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WEEKDAY = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const longDate = s => { const d = parse(s); return `${WEEKDAY[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`; };
const shortDate = s => { const d = parse(s); return `${d.getDate()}.${d.getMonth() + 1}.`; };
const num = v => { if (v === "" || v == null) return null; const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
const de = (v, dig = 1) => v == null ? "–" : (Math.round(v * 10 ** dig) / 10 ** dig).toLocaleString("de-DE", { maximumFractionDigits: dig });
const signed = (v, dig = 1) => (v > 0 ? "+" : v < 0 ? "−" : "±") + de(Math.abs(v), dig);
const ICON = {
  ok: '<svg viewBox="0 0 16 16"><path d="M3.5 8.3l3 3 6-6.6"/></svg>',
  up: '<svg viewBox="0 0 16 16"><path d="M8 13V3M4 7l4-4 4 4"/></svg>',
  ring: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5"/></svg>',
  cam: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>'
};
const LOGO = '<svg class="logo" viewBox="0 0 44 44" aria-hidden="true"><rect width="44" height="44" rx="12" fill="#0D6670"/><path d="M9 28h5l4-12 5 18 4-10h8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// ---------- Speicher ----------
const KEY = "takt-v1";
const fresh = () => ({ v: 1, name: "", onboarded: false, stage: 1, stageStart: today(), start: today(), sessions: [], draft: null, checks: [], weights: [], diary: {} });
let S = (() => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v) return Object.assign(fresh(), s); } catch (e) {} return fresh(); })();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Speichern hat nicht geklappt. Ist der Speicher voll?"); } }

const PH = {
  db: null,
  open() { return this.db || (this.db = new Promise((res, rej) => { const r = indexedDB.open("takt", 1); r.onupgradeneeded = () => r.result.createObjectStore("photos"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })); },
  async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction("photos", mode); const out = fn(t.objectStore("photos")); t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error); }); },
  put(k, v) { return this.tx("readwrite", st => st.put(v, k)); },
  get(k) { return this.tx("readonly", st => st.get(k)); },
  del(k) { return this.tx("readwrite", st => st.delete(k)); },
  clear() { return this.tx("readwrite", st => st.clear()); }
};
function shrink(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { const img = new Image(); img.onload = () => { const m = 900, k = Math.min(1, m / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", .8)); }; img.onerror = rej; img.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
function fillPhotos(root) {
  (root || document).querySelectorAll("[data-photo]").forEach(el => {
    PH.get(el.dataset.photo).then(src => { if (src) el.innerHTML = `<img src="${src}" alt="Fortschrittsfoto ${esc(shortDate(el.dataset.photo))}">` + (el.dataset.label ? `<em>${esc(el.dataset.label)}</em>` : ""); }).catch(() => {});
  });
}

// ---------- Auswertungen ----------
const weekOf = s => { const m = monday(s); return S.sessions.filter(x => x.date >= m && x.date <= addDays(m, 6)); };
const doneThisWeek = t => weekOf(today()).some(x => x.type === t);
const coreCount = arr => arr.filter(x => x.type !== "C").length;
function stageInfo() {
  const weeks = Math.floor(diffDays(S.stageStart, today()) / 7) + 1;
  const count = S.sessions.filter(x => x.stage === S.stage).length;
  const ready = S.stage < 4 && weeks > 6 && count >= 12;
  return { weeks, count, ready };
}
function lastSets(id) {
  for (let i = S.sessions.length - 1; i >= 0; i--) { const s = S.sessions[i].sets[id]; if (s && s.length) return s; }
  return null;
}
function hintFor(id, it) {
  const last = lastSets(id), e = EX[id]; if (!last || last.length < it[1]) return "";
  if (!last.every(s => (num(s.r) || 0) >= it[3])) return "";
  if (e.eq === "kg") return "Letztes Mal hast du alle Sätze am oberen Ende geschafft. Heute darfst du etwa 2,5 kg mehr nehmen.";
  if (e.eq === "sec") return "Letztes Mal alles geschafft. Versuch heute 5 Sekunden länger.";
  return "Letztes Mal alles geschafft. Mach es heute schwerer: " + (e.harder || "3 Sekunden langsam absenken") + ".";
}
const fmtSets = sets => sets.map(s => s.r || "–").join(" / ");
const target = it => { const e = EX[it[0]], u = e.eq === "sec" ? " s" : ""; return `${it[1]} × ${it[2] === it[3] ? it[2] : it[2] + "–" + it[3]}${u}${it[4] ? " je Seite" : ""}`; };
const planFor = (t, st) => PLAN[st || S.stage][t];
const planItems = p => p.blocks.flatMap(b => b.it).concat(p.extra || []);
function nextWeigh() { const w = S.weights[S.weights.length - 1]; return w ? addDays(w.date, 14) : today(); }
function lastCheck() { return S.checks[S.checks.length - 1] || null; }
const MEAS = [["waist", "Taille"], ["belly", "Bauch (Nabelhöhe)"], ["hip", "Hüfte"], ["thigh", "Oberschenkel"], ["arm", "Oberarm"]];

function wins() {
  const all = [], n = S.sessions.length;
  const add = (ok, text) => all.push({ ok, text });
  add(n >= 1, "Erstes Training geschafft");
  const ms = [10, 25, 50, 100]; ms.forEach((k, i) => { if (i === 0 || n >= ms[i - 1]) add(n >= k, `${k} Trainings`); });
  // Wochenziel: mindestens 3 Einheiten Gym, A oder B
  const weeks = {}; S.sessions.forEach(x => { const m = monday(x.date); weeks[m] = (weeks[m] || 0) + (x.type !== "C" ? 1 : 0); });
  let streak = 0, best = 0, m = monday(S.start);
  while (m <= monday(today())) { if ((weeks[m] || 0) >= 3) { streak++; best = Math.max(best, streak); } else if (m < monday(today())) streak = 0; m = addDays(m, 7); }
  add(best >= 1, "Erstes Wochenziel erreicht");
  add(best >= 3, "3 Wochen am Stück dein Wochenziel");
  if (best >= 3) add(best >= 6, "6 Wochen am Stück dein Wochenziel");
  if (S.weights.length) { const d = S.weights[0].kg - S.weights[S.weights.length - 1].kg; [1, 3, 5, 8].forEach((k, i) => { if (i === 0 || d >= [1, 3, 5, 8][i - 1]) add(d >= k, `${k} kg leichter`); }); }
  const cw = S.checks.filter(c => c.waist != null); if (cw.length) { const d = cw[0].waist - cw[cw.length - 1].waist; add(d >= 2, "Taille 2 cm schmaler"); if (d >= 2) add(d >= 5, "Taille 5 cm schmaler"); }
  // Kraft: +5 kg bei einer Übung
  const firstKg = {}, bestKg = {};
  S.sessions.forEach(x => Object.entries(x.sets).forEach(([id, sets]) => { if (EX[id] && EX[id].eq === "kg") sets.forEach(s => { const k = num(s.kg); if (k != null) { if (firstKg[id] == null) firstKg[id] = k; bestKg[id] = Math.max(bestKg[id] || 0, k); } }); }));
  Object.keys(bestKg).map(id => [id, bestKg[id] - firstKg[id]]).filter(x => x[1] >= 5).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .forEach(([id]) => all.push({ ok: true, text: `${EX[id].n}: von ${de(firstKg[id])} auf ${de(bestKg[id])} kg` }));
  const pl = Math.max(0, ...S.sessions.flatMap(x => (x.sets.plank || []).map(s => num(s.r) || 0)));
  add(pl >= 45, "Unterarmstütz 45 Sekunden" + (pl && pl < 45 ? ` (bisher ${pl} s)` : ""));
  if (pl >= 45) add(pl >= 60, "Unterarmstütz 60 Sekunden" + (pl < 60 ? ` (bisher ${pl} s)` : ""));
  return all;
}

// ---------- Oberfläche ----------
let ui = { tab: "today", sheet: null, confirm: null, done: null, guide: false, wforce: false, chartM: "waist", chartEx: null };
let restT = null, clockT = null;
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

const NAV = [["today", "Heute", '<path d="M3 11l9-7 9 7v9H3z"/>'], ["train", "Training", '<path d="M2 12h2M20 12h2M5 7v10M19 7v10M8 9v6M16 9v6M8 12h8"/>'], ["check", "Check", '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M8 13l3 3 5-6"/>'], ["stages", "Etappen", '<path d="M4 19l5-6 4 3 7-10"/><path d="M15 6h5v5"/>'], ["stats", "Statistik", '<path d="M5 20V11M12 20V4M19 20v-7"/>']];
function renderNav() {
  const nav = $("#nav");
  if (!S.onboarded || ui.guide || (S.draft && ui.tab === "session") || ui.done) { nav.hidden = true; return; }
  nav.hidden = false;
  nav.innerHTML = "<div>" + NAV.map(n => `<button type="button" data-tab="${n[0]}" class="${ui.tab === n[0] ? "on" : ""}" aria-label="${n[1]}"><svg viewBox="0 0 24 24">${n[2]}</svg>${n[1]}</button>`).join("") + "</div>";
}
function render() {
  clearInterval(clockT);
  const app = $("#app");
  if (!S.onboarded || ui.guide) app.innerHTML = viewWelcome();
  else if (ui.done) app.innerHTML = viewDone();
  else if (ui.tab === "session" && S.draft) app.innerHTML = viewSession();
  else app.innerHTML = ({ today: viewToday, train: viewTrain, check: viewCheck, stages: viewStages, stats: viewStats }[ui.tab] || viewToday)();
  renderNav(); fillPhotos(app);
  if (ui.tab === "session" && S.draft && !ui.done) startClock();
}

// ---------- Willkommen / Anleitung ----------
function viewWelcome() {
  const first = !S.onboarded;
  return `
  <div class="row between">${LOGO}${first ? "" : '<button class="close" type="button" data-act="guide-close" aria-label="Schließen">×</button>'}</div>
  <div><p class="h">${first ? "Willkommen bei Takt" : "So funktioniert Takt"}</p><p class="small" style="margin:6px 0 0">Deine Trainings-App, um wieder in deinen Rhythmus zu kommen: Fett verlieren, Muskeln aufbauen und dabei sehen, dass sich etwas tut.</p></div>
  <div class="card col">
    <span class="h3">Was die App kann</span>
    <ul class="plain">
      <li>Pro Woche 3 Einheiten: einmal Gym, zweimal zuhause. Eine vierte ist freiwillig. Wann du trainierst, entscheidest du.</li>
      <li>Jede Übung hat ein kleines <b>i</b>. Darüber siehst du eine Skizze, welche Muskeln arbeiten und wie die Ausführung geht.</li>
      <li>Im Training hakst du Sätze ab. Die App merkt sich deine Gewichte und sagt dir, wann du steigern kannst.</li>
      <li>Etwa alle 6 Wochen geht es eine Etappe weiter und neue Übungen kommen dazu.</li>
      <li>Einmal pro Woche Foto und Maßband, alle zwei Wochen die Waage. Dazu ein kurzes Tagebuch, wenn du magst.</li>
    </ul>
  </div>
  <div class="col">
    <span class="h3">Auf den Startbildschirm legen</span>
    <div class="steps-install">
      <div class="os"><b>iPhone (Safari)</b>Unten auf das Teilen-Symbol tippen (Quadrat mit Pfeil), dann „Zum Home-Bildschirm“.</div>
      <div class="os"><b>Android (Chrome)</b>Oben rechts auf die drei Punkte, dann „App installieren“ oder „Zum Startbildschirm hinzufügen“.</div>
    </div>
    <span class="small">Einmal mit Internet öffnen, danach läuft alles offline, auch im Gym ohne Empfang. Deine Daten bleiben nur auf deinem Handy. Speichere ab und zu ein Backup über das Zahnrad auf der Startseite.</span>
  </div>
  ${first ? `<div class="col"><label class="h3" for="nm">Wie heißt du?</label><input id="nm" type="text" placeholder="Dein Vorname" autocomplete="given-name" value="${esc(S.name)}"></div>
  <button class="btn" type="button" data-act="onboard">Los geht’s</button>` : '<button class="btn" type="button" data-act="guide-close">Alles klar</button>'}`;
}

// ---------- Heute ----------
function weekStrip() {
  const m = monday(today()), t = today();
  return `<div class="week">` + DOW.map((d, i) => {
    const day = addDays(m, i), ss = S.sessions.filter(x => x.date === day);
    const lab = ss.length ? ss.map(x => TYPES[x.type].s).join("+") : (day === t ? "heute" : "·");
    return `<div class="${ss.length ? "done" : ""} ${day === t ? "today" : ""}"><i style="${lab.length > 3 ? "font-size:9px" : ""}">${esc(lab)}</i>${d}</div>`;
  }).join("") + `</div>`;
}
function suggestion() {
  const open = ["gym", "A", "B"].filter(t => !doneThisWeek(t));
  if (!open.length) return { type: doneThisWeek("C") ? null : "C", allDone: true };
  // Nach einem Gym-Tag lieber zuhause, sonst Gym zuerst
  const y = S.sessions.filter(x => x.date === addDays(today(), -1));
  if (y.some(x => x.type === "gym") && open.length > 1) return { type: open.find(t => t !== "gym"), open };
  return { type: open[0], open };
}
function viewToday() {
  const t = today(), wk = coreCount(weekOf(t)), si = stageInfo();
  const sug = suggestion(), trainedToday = S.sessions.some(x => x.date === t), yday = S.sessions.some(x => x.date === addDays(t, -1) && x.type !== "C");
  const d = S.diary[t] || {};
  let hero;
  if (S.draft) {
    hero = `<div class="hero"><span class="small">Training läuft seit ${Math.round((Date.now() - S.draft.t0) / 60000)} min</span><div class="big">${TYPES[S.draft.type].t}</div><button class="btn light" type="button" data-act="resume">Weitermachen</button></div>`;
  } else if (!sug.type) {
    hero = `<div class="hero"><div class="big">Wochenziel geschafft und die Extra-Einheit auch. Stark!</div><span class="small">Jetzt ist Erholung dran. Spazierengehen zählt trotzdem.</span></div>`;
  } else {
    const p = planFor(sug.type), n = planItems(p).length - (p.extra || []).length;
    const others = ["gym", "A", "B", "C"].filter(x => x !== sug.type);
    hero = `<div class="hero">
      <div class="row between"><span class="chip" style="background:rgba(255,255,255,.16);color:#fff">${sug.allDone ? "Freiwillig" : "Vorschlag"} · ${TYPES[sug.type].t}</span><span class="small">${TYPES[sug.type].dur}</span></div>
      ${sug.allDone ? '<span class="small">Dein Wochenziel ist geschafft. Wenn du Lust hast, gibt es noch die kurze Extra-Einheit.</span>' : ""}
      ${trainedToday ? '<span class="small">Du hast heute schon trainiert. Das hier ist für einen anderen Tag gedacht.</span>' : yday && !sug.allDone ? '<span class="small">Du hast gestern trainiert. Heute wäre auch ein guter Pausentag, entscheide nach Gefühl.</span>' : ""}
      <div class="big">${esc(p.focus)}</div>
      <span class="small">${n} Übungen · Etappe ${S.stage} · ${STAGES[S.stage].n}</span>
      <button class="btn light" type="button" data-act="start" data-type="${sug.type}">Training starten</button>
      <div class="col" style="gap:6px"><span class="small">Lieber etwas anderes?</span><div class="pick">${others.map(o => `<button type="button" data-act="start" data-type="${o}">${TYPES[o].t}${doneThisWeek(o) ? " ✓" : ""}</button>`).join("")}</div></div>
    </div>`;
  }
  const wDays = diffDays(t, nextWeigh()), lc = lastCheck(), checkDue = !lc || diffDays(lc.date, t) >= 7;
  const seg = (k, labels) => `<div class="seg" data-diary="${k}">` + labels.map((l, i) => `<button type="button" class="${d[k] === i ? "sel" : ""}" data-v="${i}">${l}</button>`).join("") + `</div>`;
  return `
  <div class="row between" style="align-items:flex-start">
    <div><div class="eyebrow">${longDate(t)}</div><p class="h">${greet()}${S.name ? ", " + esc(S.name) : ""}!</p></div>
    <button class="close" type="button" data-act="settings" aria-label="Einstellungen" style="display:grid;place-items:center">${ICON.gear}</button>
  </div>
  ${weekStrip()}
  ${si.ready ? `<div class="card" style="background:var(--goodbg)"><span class="h3">Etappe ${S.stage + 1} ist freigeschaltet</span><span class="small" style="color:var(--ink)">Du warst 6 Wochen dran und hast ${si.count} Trainings geschafft. Neue Übungen warten auf dich.</span><button class="btn" type="button" data-tab="stages">Ansehen</button></div>` : ""}
  ${hero}
  <div class="tiles">
    <div class="tile"><span class="small">Diese Woche</span><b>${Math.min(wk, 3)} von 3</b><div class="bar"><span style="width:${Math.min(100, wk / 3 * 100)}%"></span></div></div>
    <button class="tile" type="button" data-tab="check" style="background:none;text-align:left;cursor:pointer">
      <span class="small">${checkDue ? "Wochen-Check" : "Nächstes Wiegen"}</span>
      <b>${checkDue ? "ist fällig" : wDays <= 0 ? "ist fällig" : wDays === 1 ? "morgen" : "in " + wDays + " Tagen"}</b>
      <span class="small">${checkDue ? "Foto und Maße" : "alle 2 Wochen"}</span>
    </button>
  </div>
  <div class="card w">
    <div class="row between"><span class="h3">Tagebuch heute</span><span class="small">freiwillig</span></div>
    <span class="small">Industriezucker heute?</span>${seg("sugar", ["kaum", "etwas", "viel"])}
    <span class="small">Wie hast du geschlafen?</span>${seg("sleep", ["schlecht", "okay", "gut"])}
    <span class="small">Wasser</span>${seg("water", ["unter 1 l", "1–2 l", "über 2 l"])}
    <label class="small" for="note">Notiz</label><textarea id="note" data-note placeholder="Wie geht es dir heute?">${esc(d.note || "")}</textarea>
  </div>`;
}
function greet() { const h = new Date().getHours(); return h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend"; }

// ---------- Training (Übersicht) ----------
function exRow(it) {
  const e = EX[it[0]];
  return `<div class="ex"><div><div class="t">${esc(e.n)}</div><div class="m">${esc(e.p.join(", "))}</div></div><span class="r">${target(it)}</span><button type="button" class="info" data-info="${it[0]}" aria-label="Infos zu ${esc(e.n)}">i</button></div>`;
}
function viewTrain() {
  return `
  <div><div class="eyebrow">Etappe ${S.stage} · ${STAGES[S.stage].n} · Woche ${Math.min(stageInfo().weeks, 99)}</div><p class="h">Training</p></div>
  <p class="small" style="margin:0">Drei Einheiten pro Woche, die Reihenfolge wählst du selbst. Zwischen zwei Krafttagen am besten ein Tag Pause. Spazierengehen zählt, ideal sind etwa 7.000 Schritte am Tag.</p>
  ${["gym", "A", "B", "C"].map(t => {
    const p = planFor(t), done = doneThisWeek(t);
    return `<div class="card ${t === "gym" ? "" : "w"}">
      <div class="row between"><span class="h2">${TYPES[t].t}</span>${done ? '<span class="chip ok">✓ diese Woche</span>' : `<span class="chip ${TYPES[t].opt ? "off" : ""}">${TYPES[t].opt ? "freiwillig · " : ""}${TYPES[t].dur}</span>`}</div>
      <span class="small">${esc(p.focus)}</span>
      <div>${p.blocks.map(b => `<div class="bl">${esc(b.l)}</div>` + b.it.map(exRow).join("")).join("")}
      ${p.extra ? `<div class="bl">Wenn noch Zeit ist</div>` + p.extra.map(exRow).join("") : ""}</div>
      <button class="btn ${t === "gym" ? "" : "ghost"}" type="button" data-act="start" data-type="${t}">${S.draft && S.draft.type === t ? "Weitermachen" : "Starten"}</button>
    </div>`;
  }).join("")}`;
}

// ---------- Training (läuft) ----------
function startSession(type) {
  if (S.draft && S.draft.type !== type) { ui.confirm = { kind: "switch", type }; ui.tab = "session"; render(); return; }
  if (!S.draft) {
    const p = planFor(type), sets = {};
    planItems(p).forEach(it => {
      const last = lastSets(it[0]), e = EX[it[0]];
      const baseKg = last && last.length ? last[last.length - 1].kg : (e.eq === "kg" && type !== "gym" ? "5" : "");
      sets[it[0]] = Array.from({ length: it[1] }, (_, i) => ({ kg: e.eq === "kg" ? (last && last[i] ? last[i].kg : baseKg) || "" : "", r: "", ok: false }));
    });
    S.draft = { type, stage: S.stage, t0: Date.now(), sets }; save();
  }
  ui.tab = "session"; ui.confirm = null; render(); window.scrollTo(0, 0);
}
function viewSession() {
  const D = S.draft, p = PLAN[D.stage][D.type], items = planItems(p), extraIds = (p.extra || []).map(x => x[0]);
  const total = items.filter(it => !extraIds.includes(it[0])).reduce((a, it) => a + it[1], 0);
  const done = Object.entries(D.sets).filter(([id]) => !extraIds.includes(id)).reduce((a, [, s]) => a + s.filter(x => x.ok).length, 0);
  const card = it => {
    const e = EX[it[0]], sets = D.sets[it[0]], last = lastSets(it[0]), hint = hintFor(it[0], it), kg = e.eq === "kg";
    const all = sets.every(s => s.ok);
    return `<div class="exc ${all ? "done" : ""}">
      <div class="row between" style="align-items:flex-start"><div><div class="t" style="font-weight:700">${esc(e.n)}</div><div class="small">${target(it)} · ${esc(e.p.join(", "))}</div></div><button type="button" class="info" data-info="${it[0]}" aria-label="Infos zu ${esc(e.n)}">i</button></div>
      ${last ? `<span class="small">Letztes Mal: ${kg && last[0].kg ? de(num(last[0].kg)) + " kg · " : ""}${fmtSets(last)}${e.eq === "sec" ? " s" : ""}</span>` : ""}
      ${hint && !all ? `<div class="hint">${ICON.up}<span>${hint}</span></div>` : ""}
      <div class="sets ${kg ? "" : "nokg"}">
        <span class="hd">Satz</span>${kg ? '<span class="hd">kg</span>' : ""}<span class="hd">${e.eq === "sec" ? "Sek." : "Wdh."}</span><span></span>
        ${sets.map((s, i) => `<span class="small">${i + 1}</span>${kg ? `<input type="text" inputmode="decimal" aria-label="Satz ${i + 1} kg" data-set="${it[0]}" data-i="${i}" data-f="kg" value="${esc(s.kg)}">` : ""}<input type="text" inputmode="numeric" aria-label="Satz ${i + 1} ${e.eq === "sec" ? "Sekunden" : "Wiederholungen"}" placeholder="${it[2] === it[3] ? it[2] : it[2] + "–" + it[3]}" data-set="${it[0]}" data-i="${i}" data-f="r" value="${esc(s.r)}"><button type="button" class="tick ${s.ok ? "on" : ""}" data-tick="${it[0]}" data-i="${i}" aria-label="Satz ${i + 1} erledigt">${ICON.ok}</button>`).join("")}
      </div>
    </div>`;
  };
  const c = ui.confirm;
  return `
  <div class="row between">
    <div><div class="eyebrow">${TYPES[D.type].t} · Etappe ${D.stage}</div><p class="h" id="clock">0:00</p></div>
    <div style="text-align:right;min-width:120px"><div class="small">${done} von ${total} Sätzen</div><div class="bar" style="margin-top:6px"><span style="width:${total ? done / total * 100 : 0}%"></span></div></div>
  </div>
  ${c && c.kind === "switch" ? `<div class="confirm"><span>Gerade läuft ${TYPES[D.type].t}. Möchtest du das verwerfen und ${TYPES[c.type].t} starten?</span><div class="row"><button class="btn sm danger" type="button" data-act="switch-yes">Ja, wechseln</button><button class="btn sm line" type="button" data-act="confirm-no">Nein, weiter</button></div></div>` : ""}
  <span class="small">${D.type === "gym" ? WARM.gym : WARM.home}${p.timed ? " " + p.focus : ""} Übungen im selben Block machst du im Wechsel: erst ein Satz von der ersten, dann einer von der zweiten.</span>
  ${p.blocks.map(b => `<div class="bl">${esc(b.l)}</div>` + b.it.map(card).join("")).join("")}
  ${p.extra ? `<div class="bl">Wenn noch Zeit ist</div>` + p.extra.map(card).join("") : ""}
  ${c && c.kind === "cancel" ? `<div class="confirm"><span>Training verwerfen? Die Einträge von heute gehen verloren.</span><div class="row"><button class="btn sm danger" type="button" data-act="cancel-yes">Verwerfen</button><button class="btn sm line" type="button" data-act="confirm-no">Zurück</button></div></div>` : ""}
  ${c && c.kind === "empty" ? `<div class="confirm" style="background:var(--soft)"><span>Hak mindestens einen Satz ab, dann kannst du speichern.</span></div>` : ""}
  <button class="btn" type="button" data-act="finish">Training beenden und speichern</button>
  <div class="row between"><button class="link" type="button" data-act="pause-session">Später weitermachen</button><button class="link" type="button" data-act="cancel" style="color:#A8402E">Verwerfen</button></div>`;
}
function startClock() {
  const upd = () => { const el = $("#clock"); if (!el || !S.draft) return; const s = Math.floor((Date.now() - S.draft.t0) / 1000); el.textContent = `${Math.floor(s / 60)}:${pad(s % 60)}`; };
  upd(); clockT = setInterval(upd, 1000);
}
function startRest(sec) {
  stopRest();
  const bar = document.createElement("div"); bar.className = "restbar"; bar.id = "rest";
  bar.innerHTML = `<div><span>Pause</span><b id="restT"></b><div class="bar"><span id="restB" style="width:100%"></span></div><button type="button" data-act="rest-skip">Weiter</button></div>`;
  document.body.appendChild(bar);
  const end = Date.now() + sec * 1000;
  const tick = () => { const left = Math.max(0, Math.ceil((end - Date.now()) / 1000)); const t = $("#restT"), b = $("#restB"); if (!t) return; t.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`; b.style.width = (left / sec * 100) + "%"; if (left <= 0) { try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {} stopRest(); } };
  tick(); restT = setInterval(tick, 250);
}
function stopRest() { clearInterval(restT); const r = $("#rest"); if (r) r.remove(); }
function finish() {
  const D = S.draft, sets = {};
  Object.entries(D.sets).forEach(([id, arr]) => { const ok = arr.filter(s => s.ok).map(s => ({ kg: s.kg, r: s.r })); if (ok.length) sets[id] = ok; });
  if (!Object.keys(sets).length) { ui.confirm = { kind: "empty" }; render(); return; }
  const before = wins().filter(w => w.ok).map(w => w.text);
  const sess = { id: Date.now(), date: ymd(new Date(D.t0)), type: D.type, stage: D.stage, min: Math.max(1, Math.round((Date.now() - D.t0) / 60000)), sets };
  S.sessions.push(sess); S.sessions.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id); S.draft = null; save(); stopRest();
  const fresh = wins().filter(w => w.ok && !before.includes(w.text)).map(w => w.text);
  ui.done = { sess, fresh }; ui.confirm = null; render(); window.scrollTo(0, 0);
}
function viewDone() {
  const { sess, fresh } = ui.done, n = Object.values(sess.sets).reduce((a, s) => a + s.length, 0), wk = coreCount(weekOf(sess.date));
  return `
  <div style="padding-top:20px">${LOGO}</div>
  <p class="h">Geschafft!</p>
  <div class="tiles"><div class="tile"><span class="small">Dauer</span><b>${sess.min} min</b></div><div class="tile"><span class="small">Sätze</span><b>${n}</b></div></div>
  <div class="card"><span class="h3">${wk >= 3 ? "Wochenziel erreicht" : `Diese Woche: ${wk} von 3`}</span><div class="bar"><span style="width:${Math.min(100, wk / 3 * 100)}%"></span></div></div>
  ${fresh.length ? `<div class="card w"><span class="h3">Neu erreicht</span>${fresh.map(f => `<div class="win"><i>${ICON.ok}</i><span>${esc(f)}</span></div>`).join("")}</div>` : ""}
  <button class="btn" type="button" data-act="done-close">Zurück zu Heute</button>`;
}

// ---------- Übungs-Infos ----------
function openInfo(id) {
  const e = EX[id]; if (!e) return;
  const figs = e.start ? `<div class="poses"><div class="pose">${sketch(e.start)}Start</div><div class="pose">${sketch(e.pose)}Ende</div></div>` : `<div class="pose">${sketch(e.pose)}</div>`;
  openSheet(`<div class="row between" style="align-items:flex-start"><div><div class="eyebrow">Infos zur Übung</div><span class="h2">${esc(e.n)}</span></div><button class="close" type="button" data-act="sheet-close" aria-label="Schließen">×</button></div>
    ${figs}
    <div class="col"><span class="eyebrow">Das arbeitet</span><div class="muscles">${e.p.map(x => `<span class="mus p">${esc(x)}</span>`).join("")}${e.s.map(x => `<span class="mus s">${esc(x)}</span>`).join("")}</div></div>
    <div class="col"><span class="eyebrow">So geht’s</span><ol class="steps">${e.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ol></div>
    <div class="tiles"><div class="tile"><span class="small">Leichter</span><span style="font-size:14px">${esc(e.easier || "–")}</span></div><div class="tile"><span class="small">Schwerer</span><span style="font-size:14px">${esc(e.harder || "–")}</span></div></div>`);
}
function openSheet(html) {
  closeSheet();
  const sc = document.createElement("div"); sc.className = "scrim"; sc.id = "sheet";
  sc.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  sc.addEventListener("click", ev => { if (ev.target === sc) closeSheet(); });
  document.body.appendChild(sc); document.body.style.overflow = "hidden";
  const c = sc.querySelector(".close"); if (c) c.focus();
}
function closeSheet() { const s = $("#sheet"); if (s) s.remove(); document.body.style.overflow = ""; }

// ---------- Check ----------
function viewCheck() {
  const t = today(), cur = S.checks.find(c => c.date === t) || {}, prev = S.checks.filter(c => c.date < t).slice(-1)[0];
  const lc = lastCheck(), w = S.weights.find(x => x.date === t), showW = ui.wforce || w || diffDays(t, nextWeigh()) <= 0;
  const lastW = S.weights.filter(x => x.date < t).slice(-1)[0];
  const first = S.checks.find(c => c.photo);
  return `
  <div><div class="eyebrow">${longDate(t)}</div><p class="h">Wochen-Check</p></div>
  <p class="small" style="margin:0">${lc && lc.date !== t ? `Letzter Check am ${shortDate(lc.date)}. ` : ""}Einmal pro Woche, am besten morgens vor dem Frühstück. Dauert etwa fünf Minuten.</p>
  <div class="photo">
    ${first && first.date !== t ? `<div class="ph" data-photo="${first.date}" data-label="Start ${shortDate(first.date)}"></div>` : ""}
    <label class="ph add" for="photoIn" ${cur.photo ? `data-photo="${t}" data-label="Heute"` : ""}>${ICON.cam}${cur.photo ? "Foto ersetzen" : "Foto aufnehmen"}</label>
    ${!first || first.date === t ? `<div class="ph" style="font-size:13px;color:var(--muted);text-align:center;padding:12px">Gleicher Ort, gleiches Licht, gleiche Kleidung</div>` : ""}
  </div>
  <input id="photoIn" type="file" accept="image/*" hidden>
  <div class="card w">
    <div class="row between"><span class="h3">Maße in cm</span><span class="small">${prev ? "zum " + shortDate(prev.date) : ""}</span></div>
    <div>${MEAS.map(([k, l]) => { const v = cur[k], pv = prev && prev[k], dd = v != null && pv != null ? v - pv : null;
      return `<div class="mrow"><label for="m_${k}">${l}</label><input id="m_${k}" type="text" inputmode="decimal" data-meas="${k}" value="${v != null ? de(v) : ""}" placeholder="${pv != null ? de(pv) : ""}"><span class="delta ${dd < 0 ? "down" : ""}">${dd == null ? "" : dd === 0 ? "gleich" : signed(dd)}</span></div>`; }).join("")}</div>
    <button class="link" type="button" data-act="howto" style="text-align:left">Wo genau messen?</button>
  </div>
  <div class="card w">
    <div class="row between"><span class="h3">Gewicht</span><span class="small">alle 2 Wochen</span></div>
    ${showW ? `<div class="mrow" style="border:0"><label for="wIn">kg</label><input id="wIn" type="text" inputmode="decimal" data-weight value="${w ? de(w.kg) : ""}" placeholder="${lastW ? de(lastW.kg) : ""}"><span class="delta ${w && lastW && w.kg < lastW.kg ? "down" : ""}">${w && lastW ? signed(w.kg - lastW.kg) : ""}</span></div>`
      : `<span class="small">${lastW ? `Zuletzt ${de(lastW.kg)} kg am ${shortDate(lastW.date)}. ` : ""}Nächstes Mal am ${shortDate(nextWeigh())}.</span><button class="link" type="button" data-act="wforce" style="text-align:left">Trotzdem heute eintragen</button>`}
  </div>
  <span class="small">Wird automatisch gespeichert.</span>
  ${S.checks.length ? `<div class="col"><span class="h3">Bisherige Checks</span>${S.checks.slice().reverse().slice(0, 8).map(c => { const ww = S.weights.find(x => x.date === c.date);
    return `<div class="ex" style="grid-template-columns:1fr auto"><div><div class="t">${shortDate(c.date)}</div><div class="m">${MEAS.filter(([k]) => c[k] != null).map(([k, l]) => `${l.split(" ")[0]} ${de(c[k])}`).join(" · ") || "nur Foto"}</div></div><span class="r">${ww ? de(ww.kg) + " kg" : ""}${c.photo ? (ww ? " · " : "") + "Foto" : ""}</span></div>`; }).join("")}</div>` : ""}`;
}
function howto() {
  openSheet(`<div class="row between"><span class="h2">Wo messen?</span><button class="close" type="button" data-act="sheet-close" aria-label="Schließen">×</button></div>
  <div class="row" style="align-items:flex-start;gap:16px"><svg viewBox="0 0 60 110" style="width:80px;flex:none" aria-hidden="true"><circle cx="30" cy="12" r="8" fill="#BFD7DD"/><path d="M19 26q11-5 22 0l3 18q-3 10 2 20l-3 42h-7l-3-34h-2l-3 34h-7l-3-42q5-10 2-20z" fill="#BFD7DD"/><path d="M19 27l-7 30M41 27l7 30" stroke="#BFD7DD" stroke-width="6" stroke-linecap="round"/><g stroke="#0D6670" stroke-width="2" stroke-linecap="round"><line x1="9" y1="38" x2="16" y2="36"/><line x1="16" y1="44" x2="44" y2="44"/><line x1="15" y1="54" x2="45" y2="54"/><line x1="14" y1="63" x2="46" y2="63"/><line x1="17" y1="78" x2="29" y2="78"/></g></svg>
  <ul class="plain"><li><b>Taille:</b> an der schmalsten Stelle, meist etwas über dem Nabel.</li><li><b>Bauch:</b> genau auf Nabelhöhe, entspannt ausatmen.</li><li><b>Hüfte:</b> an der breitesten Stelle des Pos.</li><li><b>Oberschenkel:</b> eine Handbreit unter dem Schritt, immer dasselbe Bein.</li><li><b>Oberarm:</b> in der Mitte zwischen Schulter und Ellbogen, Arm locker hängen lassen.</li></ul></div>
  <span class="small">Das Maßband liegt an, schnürt aber nicht ein. Immer zur selben Tageszeit messen.</span>`);
}
function upsertCheck(patch) {
  const t = today(); let c = S.checks.find(x => x.date === t);
  if (!c) { c = { date: t }; S.checks.push(c); S.checks.sort((a, b) => a.date < b.date ? -1 : 1); }
  Object.assign(c, patch);
  if (MEAS.every(([k]) => c[k] == null) && !c.photo) S.checks = S.checks.filter(x => x !== c);
  save();
}

// ---------- Etappen ----------
function newIn(st) {
  const prev = new Set(st > 1 ? ["gym", "A", "B", "C"].flatMap(t => planItems(PLAN[st - 1][t]).map(i => i[0])) : []);
  const ids = []; ["gym", "A", "B", "C"].forEach(t => planItems(PLAN[st][t]).forEach(i => { if (!prev.has(i[0]) && !ids.includes(i[0])) ids.push(i[0]); }));
  return st === 1 ? ids.filter(id => ["rdl", "bridgeLoop", "sideplankKnee", "deadbug", "goblet"].includes(id)) : ids;
}
function viewStages() {
  const si = stageInfo(), w = wins(), got = w.filter(x => x.ok), next = w.filter(x => !x.ok).slice(0, 3);
  return `
  <div><div class="eyebrow">Dein Weg</div><p class="h">Etappen</p></div>
  <div class="card">
    <div class="row between"><span class="h3">Etappe ${S.stage} · ${STAGES[S.stage].n}</span><span class="small">Woche ${si.weeks}${S.stage < 4 ? " von 6" : ""}</span></div>
    ${S.stage < 4 ? `<div class="bar"><span style="width:${Math.min(100, (Math.min(si.weeks - 1, 6) / 6 * 50) + (Math.min(si.count, 12) / 12 * 50))}%"></span></div>
    <span class="small">${si.count} von 12 Trainings in dieser Etappe. Nach 6 Wochen und 12 Trainings geht es weiter. Fehlen ein paar, dauert die Etappe einfach etwas länger.</span>
    ${si.ready ? `<button class="btn" type="button" data-act="next-stage">Etappe ${S.stage + 1} starten</button>` : ""}` : `<span class="small">Du bist in der letzten Etappe. Hier bleibst du und steigerst die Gewichte weiter.</span>`}
  </div>
  <div class="col" style="gap:16px">${[1, 2, 3, 4].map(st => `<div class="stage ${st === S.stage ? "now" : st < S.stage ? "past" : ""}"><span class="n">${st}</span><div><span class="h3">${STAGES[st].n}</span><div class="small">${STAGES[st].weeks} · ${STAGES[st].goal}</div><div class="new">${newIn(st).map(id => `<button type="button" class="chip ${st > S.stage ? "off" : ""}" data-info="${id}">${esc(EX[id].n)}</button>`).join("")}</div></div></div>`).join("")}</div>
  <div class="col"><span class="eyebrow">Schon geschafft</span>
    ${got.length ? got.map(x => `<div class="win"><i>${ICON.ok}</i><span>${esc(x.text)}</span></div>`).join("") : '<div class="empty">Nach deinem ersten Training steht hier dein erster Erfolg.</div>'}
  </div>
  ${next.length ? `<div class="col"><span class="eyebrow">Als Nächstes</span>${next.map(x => `<div class="win next"><i>${ICON.ring}</i><span>${esc(x.text)}</span></div>`).join("")}</div>` : ""}`;
}

// ---------- Statistik ----------
function lineChart(pts, opts) {
  if (pts.length < 2) return `<div class="empty">${opts.empty}</div>`;
  const W = 320, H = 140, L = 40, R = 26, T = 18, B = 24, ys = pts.map(p => p.y);
  let lo = Math.min(...ys), hi = Math.max(...ys); const padv = Math.max((hi - lo) * .2, opts.minPad || 1); lo = Math.floor(lo - padv); hi = Math.ceil(hi + padv);
  const sx = i => L + i / (pts.length - 1) * (W - L - R), sy = y => T + (hi - y) / (hi - lo) * (H - T - B);
  const ticks = [lo, (lo + hi) / 2, hi];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label)}">`;
  ticks.forEach(t => s += `<line x1="${L}" x2="${W - R}" y1="${sy(t)}" y2="${sy(t)}" stroke="#E1EBEE"/><text x="${L - 6}" y="${sy(t) + 4}" font-size="10" text-anchor="end" fill="#5E737A">${de(t)}</text>`);
  const step = Math.ceil(pts.length / 6);
  pts.forEach((p, i) => { if (i % step === 0 || i === pts.length - 1) s += `<text x="${sx(i)}" y="${H - 6}" font-size="10" text-anchor="middle" fill="#5E737A">${esc(p.x)}</text>`; });
  const xy = pts.map((p, i) => [sx(i), sy(p.y)]);
  s += `<path d="M${xy[0][0]},${sy(lo)} L${xy.map(p => p.join(",")).join(" L")} L${xy[xy.length - 1][0]},${sy(lo)}Z" fill="${opts.col}" opacity=".1"/>`;
  s += `<polyline points="${xy.map(p => p.join(",")).join(" ")}" fill="none" stroke="${opts.col}" stroke-width="2.5" stroke-linejoin="round"/>`;
  xy.forEach((p, i) => s += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === xy.length - 1 ? 4.5 : 3}" fill="${i === xy.length - 1 ? opts.col : "#fff"}" stroke="${opts.col}" stroke-width="2"/>`);
  const lp = xy[xy.length - 1]; s += `<text x="${lp[0] - 8}" y="${lp[1] - 10}" font-size="11" font-weight="700" text-anchor="end" fill="#13272E">${de(ys[ys.length - 1])}</text>`;
  return s + "</svg>";
}
function viewStats() {
  const t = today(), W = S.weights, cs = S.checks;
  const wD = W.length > 1 ? W[W.length - 1].kg - W[0].kg : null;
  const waist = cs.filter(c => c.waist != null), waD = waist.length > 1 ? waist[waist.length - 1].waist - waist[0].waist : null;
  const mPts = cs.filter(c => c[ui.chartM] != null).map(c => ({ x: shortDate(c.date), y: c[ui.chartM] }));
  // Kraft
  const kgEx = []; S.sessions.forEach(x => Object.keys(x.sets).forEach(id => { if (EX[id] && EX[id].eq === "kg" && !kgEx.includes(id) && x.sets[id].some(s => num(s.kg) != null)) kgEx.push(id); }));
  const exSel = kgEx.includes(ui.chartEx) ? ui.chartEx : kgEx[0];
  const sPts = exSel ? S.sessions.filter(x => x.sets[exSel]).map(x => ({ x: shortDate(x.date), y: Math.max(...x.sets[exSel].map(s => num(s.kg) || 0)) })).filter(p => p.y > 0) : [];
  // Regelmäßigkeit: letzte 8 Wochen
  const m0 = monday(t);
  let heat = '<span></span>' + DOW.map(d => `<span style="text-align:center">${d}</span>`).join("");
  for (let w = 7; w >= 0; w--) { const m = addDays(m0, -7 * w); heat += `<span>${shortDate(m)}</span>` + DOW.map((_, i) => { const d = addDays(m, i), ss = S.sessions.filter(x => x.date === d); return `<b class="${ss.some(x => x.type === "gym") ? "g" : ss.length ? "h" : ""}" title="${shortDate(d)}"></b>`; }).join(""); }
  // Zucker pro Woche
  const sug = []; for (let w = 7; w >= 0; w--) { const m = addDays(m0, -7 * w); let n = 0, any = 0; for (let i = 0; i < 7; i++) { const d = S.diary[addDays(m, i)]; if (d && d.sugar != null) { any++; if (d.sugar === 2) n++; } } sug.push({ m, n, any }); }
  const sugBars = (() => { const Wd = 320, H = 110, L = 22, B = 22, T = 14, step = (Wd - L - 6) / 8, bw = 20, max = 7;
    let s = `<svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Tage mit viel Zucker pro Woche">`;
    [0, 7].forEach(v => { const y = T + (max - v) / max * (H - T - B); s += `<line x1="${L}" x2="${Wd - 6}" y1="${y}" y2="${y}" stroke="#E1EBEE"/><text x="${L - 6}" y="${y + 4}" font-size="10" text-anchor="end" fill="#5E737A">${v}</text>`; });
    sug.forEach((w, i) => { const cx = L + step * i + step / 2, y = T + (max - w.n) / max * (H - T - B), y0 = H - B; if (w.any) s += `<rect x="${cx - bw / 2}" y="${Math.min(y, y0 - 2)}" width="${bw}" height="${Math.max(2, y0 - y)}" rx="4" fill="${i === 7 ? "#0D6670" : "#A9D0D8"}"/><text x="${cx}" y="${Math.min(y, y0 - 2) - 4}" font-size="10" text-anchor="middle" fill="#13272E">${w.n}</text>`; s += `<text x="${cx}" y="${H - 6}" font-size="9.5" text-anchor="middle" fill="#5E737A">${shortDate(w.m)}</text>`; });
    return s + "</svg>"; })();
  const photos = cs.filter(c => c.photo);
  return `
  <div><div class="eyebrow">Seit dem ${shortDate(S.start)}</div><p class="h">Statistik</p></div>
  <div class="tiles">
    <div class="tile"><span class="small">Trainings</span><b>${S.sessions.length}</b><span class="small">${S.sessions.reduce((a, x) => a + x.min, 0)} Minuten</span></div>
    <div class="tile"><span class="small">Gewicht</span><b>${wD == null ? "–" : signed(wD) + " kg"}</b><span class="small">${W.length ? de(W[0].kg) + " → " + de(W[W.length - 1].kg) : "noch nicht gewogen"}</span></div>
    <div class="tile"><span class="small">Taille</span><b>${waD == null ? "–" : signed(waD) + " cm"}</b><span class="small">${waist.length ? de(waist[0].waist) + " → " + de(waist[waist.length - 1].waist) : "noch nicht gemessen"}</span></div>
    <div class="tile"><span class="small">Etappe</span><b>${S.stage} · ${STAGES[S.stage].n}</b><span class="small">Woche ${stageInfo().weeks}</span></div>
  </div>
  ${photos.length >= 2 ? `<div class="card w"><span class="h3">Vorher und jetzt</span><div class="photo"><div class="ph" data-photo="${photos[0].date}" data-label="${shortDate(photos[0].date)}"></div><div class="ph" data-photo="${photos[photos.length - 1].date}" data-label="${shortDate(photos[photos.length - 1].date)}"></div></div></div>` : ""}
  <div class="card w chart"><div class="row between"><span class="h3">Gewicht</span><span class="small">kg</span></div>${lineChart(W.map(w => ({ x: shortDate(w.date), y: w.kg })), { col: "#0D6670", label: "Gewicht", empty: "Nach dem zweiten Wiegen siehst du hier deine Kurve." })}</div>
  <div class="card w chart"><div class="row between"><span class="h3">Maße</span><span class="small">cm</span></div>
    <select id="mSel" data-chart="m" aria-label="Maß wählen">${MEAS.map(([k, l]) => `<option value="${k}" ${k === ui.chartM ? "selected" : ""}>${l}</option>`).join("")}</select>
    ${lineChart(mPts, { col: "#0D6670", label: "Maße", empty: "Nach dem zweiten Wochen-Check siehst du hier deine Kurve." })}</div>
  <div class="card w chart"><div class="row between"><span class="h3">Kraft</span><span class="small">schwerster Satz, kg</span></div>
    ${kgEx.length ? `<select id="eSel" data-chart="e" aria-label="Übung wählen">${kgEx.map(id => `<option value="${id}" ${id === exSel ? "selected" : ""}>${esc(EX[id].n)}</option>`).join("")}</select>` : ""}
    ${lineChart(sPts, { col: "#5AA5B5", label: "Kraft", empty: "Nach zwei Trainings mit Gewicht siehst du hier, wie du stärker wirst.", minPad: 2 })}</div>
  <div class="card w"><div class="row between"><span class="h3">Regelmäßigkeit</span><span class="small">letzte 8 Wochen</span></div><div class="heat">${heat}</div><div class="legend"><span><i style="background:var(--petrol)"></i>Gym</span><span><i style="background:var(--mist)"></i>Zuhause</span></div></div>
  <div class="card w chart"><div class="row between"><span class="h3">Tage mit viel Zucker</span><span class="small">pro Woche</span></div>${sug.some(w => w.any) ? sugBars : '<div class="empty">Wenn du das Tagebuch nutzt, siehst du hier deine Wochen.</div>'}</div>`;
}

// ---------- Einstellungen und Backup ----------
function openSettings() {
  const c = ui.confirm && ui.confirm.kind === "wipe";
  openSheet(`<div class="row between"><span class="h2">Einstellungen</span><button class="close" type="button" data-act="sheet-close" aria-label="Schließen">×</button></div>
  <div class="col"><label class="h3" for="setName">Dein Name</label><input id="setName" type="text" value="${esc(S.name)}" data-name></div>
  <button class="btn ghost" type="button" data-act="guide">Anleitung ansehen</button>
  <div class="col"><span class="h3">Backup</span><span class="small">Deine Daten liegen nur auf diesem Handy. Speichere ab und zu ein Backup, zum Beispiel in deinen Dateien oder per Mail an dich selbst.</span>
    <div class="row"><button class="btn sm" type="button" data-act="export" style="flex:1">Backup speichern</button><label class="btn sm line" for="importIn" style="flex:1">Backup laden</label></div>
    <input id="importIn" type="file" accept="application/json,.json" hidden></div>
  <div class="col"><span class="h3">Etappe</span><span class="small">Normalerweise geht es automatisch weiter. Hier kannst du sie von Hand wechseln.</span>
    <div class="seg">${[1, 2, 3, 4].map(st => `<button type="button" class="${st === S.stage ? "sel" : ""}" data-act="set-stage" data-st="${st}">${st}</button>`).join("")}</div></div>
  <div class="col">${c ? `<div class="confirm"><span>Wirklich alles löschen? Trainings, Maße, Fotos und Tagebuch sind dann weg.</span><div class="row"><button class="btn sm danger" type="button" data-act="wipe-yes">Alles löschen</button><button class="btn sm line" type="button" data-act="wipe-no">Abbrechen</button></div></div>` : '<button class="link" type="button" data-act="wipe" style="color:#A8402E;text-align:left">Alle Daten löschen</button>'}</div>
  <span class="small">Takt · Version 1 · funktioniert offline</span>`);
}
async function exportData() {
  const photos = {};
  for (const c of S.checks.filter(c => c.photo)) { try { photos[c.date] = await PH.get(c.date); } catch (e) {} }
  const blob = new Blob([JSON.stringify({ app: "takt", v: 1, data: S, photos })], { type: "application/json" });
  const name = `takt-backup-${today()}.json`;
  try { const f = new File([blob], name, { type: "application/json" }); if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: "Takt Backup" }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
async function importData(file) {
  try {
    const j = JSON.parse(await file.text()); if (!j || j.app !== "takt" || !j.data) throw new Error("x");
    S = Object.assign(fresh(), j.data); S.onboarded = true; save();
    await PH.clear(); for (const [k, v] of Object.entries(j.photos || {})) if (v) await PH.put(k, v);
    closeSheet(); ui.tab = "today"; render(); toast("Backup geladen");
  } catch (e) { toast("Diese Datei ist kein Takt-Backup."); }
}

// ---------- Ereignisse ----------
document.addEventListener("click", async ev => {
  const tabBtn = ev.target.closest("[data-tab]");
  if (tabBtn) { closeSheet(); ui.tab = tabBtn.dataset.tab; ui.confirm = null; ui.wforce = false; render(); window.scrollTo(0, 0); return; }
  const info = ev.target.closest("[data-info]"); if (info) { openInfo(info.dataset.info); return; }
  const tick = ev.target.closest("[data-tick]");
  if (tick && S.draft) {
    const id = tick.dataset.tick, i = +tick.dataset.i, s = S.draft.sets[id][i]; s.ok = !s.ok;
    if (s.ok && !s.r) { const it = planItems(PLAN[S.draft.stage][S.draft.type]).find(x => x[0] === id); s.r = String(it ? it[2] : ""); }
    if (s.ok && s.kg) S.draft.sets[id].forEach((x, j) => { if (j > i && !x.kg && !x.ok) x.kg = s.kg; });
    save(); const y = window.scrollY; render(); window.scrollTo(0, y);
    if (s.ok) startRest(TYPES[S.draft.type].rest);
    return;
  }
  const seg = ev.target.closest("[data-diary] button");
  if (seg) { const k = seg.parentElement.dataset.diary, v = +seg.dataset.v, t = today(); const d = S.diary[t] = S.diary[t] || {}; d[k] = d[k] === v ? null : v; save(); seg.parentElement.querySelectorAll("button").forEach(b => b.classList.toggle("sel", +b.dataset.v === d[k])); return; }
  const a = ev.target.closest("[data-act]"); if (!a) return;
  const act = a.dataset.act;
  if (act === "onboard") { const n = $("#nm"); S.name = n ? n.value.trim() : ""; S.onboarded = true; S.start = S.stageStart = today(); save(); ui.tab = "today"; render(); }
  else if (act === "guide") { closeSheet(); ui.guide = true; render(); window.scrollTo(0, 0); }
  else if (act === "guide-close") { ui.guide = false; render(); }
  else if (act === "start") startSession(a.dataset.type);
  else if (act === "resume") { ui.tab = "session"; render(); }
  else if (act === "switch-yes") { const t = ui.confirm.type; S.draft = null; save(); stopRest(); startSession(t); }
  else if (act === "confirm-no") { ui.confirm = null; render(); }
  else if (act === "cancel") { ui.confirm = { kind: "cancel" }; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (act === "cancel-yes") { S.draft = null; save(); stopRest(); ui.confirm = null; ui.tab = "today"; render(); }
  else if (act === "pause-session") { stopRest(); ui.tab = "today"; render(); }
  else if (act === "finish") finish();
  else if (act === "done-close") { ui.done = null; ui.tab = "today"; render(); }
  else if (act === "rest-skip") stopRest();
  else if (act === "sheet-close") { ui.confirm = null; closeSheet(); }
  else if (act === "settings") openSettings();
  else if (act === "howto") howto();
  else if (act === "wforce") { ui.wforce = true; render(); const w = $("#wIn"); if (w) w.focus(); }
  else if (act === "next-stage") { if (stageInfo().ready) { S.stage++; S.stageStart = today(); save(); render(); toast(`Etappe ${S.stage} · ${STAGES[S.stage].n} beginnt`); } }
  else if (act === "set-stage") { const st = +a.dataset.st; if (st !== S.stage) { S.stage = st; S.stageStart = today(); save(); } openSettings(); render(); }
  else if (act === "export") exportData();
  else if (act === "wipe") { ui.confirm = { kind: "wipe" }; openSettings(); }
  else if (act === "wipe-no") { ui.confirm = null; openSettings(); }
  else if (act === "wipe-yes") { try { await PH.clear(); } catch (e) {} S = fresh(); save(); ui = { tab: "today", chartM: "waist" }; closeSheet(); render(); }
});
document.addEventListener("input", ev => {
  const el = ev.target;
  if (el.dataset.set && S.draft) { const s = S.draft.sets[el.dataset.set][+el.dataset.i]; s[el.dataset.f] = el.value.trim(); save(); }
  else if (el.dataset.note !== undefined) { const t = today(); const d = S.diary[t] = S.diary[t] || {}; d.note = el.value; save(); }
  else if (el.dataset.name !== undefined) { S.name = el.value.trim(); save(); }
});
document.addEventListener("change", async ev => {
  const el = ev.target;
  if (el.dataset.meas) { upsertCheck({ [el.dataset.meas]: num(el.value) }); render(); }
  else if (el.dataset.weight !== undefined) {
    const v = num(el.value), t = today(); S.weights = S.weights.filter(w => w.date !== t);
    if (v != null && v > 20 && v < 400) S.weights.push({ date: t, kg: v }); else if (v != null) toast("Bitte das Gewicht in kg eintragen.");
    S.weights.sort((a, b) => a.date < b.date ? -1 : 1); save(); render();
  }
  else if (el.id === "photoIn" && el.files[0]) {
    try { const data = await shrink(el.files[0]); await PH.put(today(), data); upsertCheck({ photo: true }); render(); toast("Foto gespeichert"); }
    catch (e) { toast("Das Foto konnte nicht gespeichert werden."); }
  }
  else if (el.id === "importIn" && el.files[0]) importData(el.files[0]);
  else if (el.dataset.chart === "m") { ui.chartM = el.value; render(); }
  else if (el.dataset.chart === "e") { ui.chartEx = el.value; render(); }
});
document.addEventListener("keydown", ev => { if (ev.key === "Escape") closeSheet(); });
if (S.draft) ui.tab = "today";
render();
