// Takt: Übungskatalog, Skizzen und Pläne für die vier Etappen.
"use strict";

// ---------- Skizzen ----------
const C = { limb: "#2C424A", back: "#B7C8CD", hl: "#0D6670", prop: "#9FB4BA", band: "#5AA5B5" };
const db = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="${C.limb}"/><circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`;
const plate = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.prop}"/><circle cx="${x}" cy="${y}" r="2.5" fill="#fff"/>`;
const ground = y => `<line x1="2" y1="${y}" x2="118" y2="${y}" stroke="${C.prop}" stroke-width="2"/>`;
const seat = `<rect x="34" y="87" width="40" height="5" rx="2" fill="${C.prop}"/>`;
const loop = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="9" fill="none" stroke="${C.band}" stroke-width="3"/>`;
const ST = { head: [60, 15], torso: [[60, 26], [60, 60]], legB: [[60, 60], [58, 84], [57, 108], [65, 108]], legF: [[60, 60], [62, 84], [61, 108], [69, 108]] };
const stand = o => Object.assign({}, ST, o);

const POSES = {
  rdlT: stand({ armB: [[59, 29], [58, 45], [59, 62]], armF: [[61, 29], [63, 45], [64, 62]], props: db(64, 64), zones: [[[61, 62], [62, 82]]], dots: [[56, 61]] }),
  rdlB: { head: [93, 40], torso: [[84, 46], [50, 60]], legB: [[50, 60], [53, 84], [51, 108], [59, 108]], legF: [[50, 60], [57, 84], [55, 108], [63, 108]], armB: [[80, 48], [79, 64], [79, 80]], armF: [[83, 47], [83, 64], [83, 82]], props: db(83, 84), zones: [[[52, 62], [55, 82]], [[66, 56], [52, 60]]], dots: [[47, 58]] },
  rdlBB: { head: [93, 40], torso: [[84, 46], [50, 60]], legB: [[50, 60], [53, 84], [51, 108], [59, 108]], legF: [[50, 60], [57, 84], [55, 108], [63, 108]], armB: [[80, 48], [79, 64], [79, 80]], armF: [[83, 47], [83, 64], [83, 82]], props: plate(82, 88, 13), zones: [[[52, 62], [55, 82]], [[66, 56], [52, 60]]], dots: [[47, 58]] },
  legpress: { head: [22, 58], torso: [[30, 66], [54, 88]], legB: [[54, 88], [64, 58], [88, 62], [90, 54]], legF: [[54, 88], [68, 60], [92, 66], [94, 58]], armF: [[34, 70], [44, 86], [52, 98]], props: `<line x1="14" y1="62" x2="56" y2="100" stroke="${C.prop}" stroke-width="5" stroke-linecap="round"/><line x1="96" y1="40" x2="100" y2="80" stroke="${C.prop}" stroke-width="5" stroke-linecap="round"/>`, zones: [[[56, 86], [68, 60]]], dots: [[52, 92]] },
  pulldown: { head: [56, 40], torso: [[56, 51], [56, 84]], legB: [[56, 84], [76, 84], [76, 106], [84, 106]], legF: [[56, 84], [78, 84], [78, 106], [86, 106]], armB: [[55, 53], [44, 34], [42, 15]], armF: [[57, 53], [68, 34], [70, 15]], props: `<line x1="26" y1="14" x2="86" y2="14" stroke="${C.prop}" stroke-width="4" stroke-linecap="round"/><line x1="56" y1="14" x2="56" y2="2" stroke="${C.prop}" stroke-width="2"/><rect x="42" y="87" width="32" height="5" rx="2" fill="${C.prop}"/>`, zones: [[[57, 55], [57, 72]]] },
  row: { head: [48, 42], torso: [[48, 53], [44, 88]], legB: [[44, 88], [68, 82], [92, 92], [94, 84]], legF: [[44, 88], [70, 84], [94, 94], [96, 86]], armF: [[48, 56], [34, 70], [56, 72]], props: `<line x1="56" y1="72" x2="118" y2="72" stroke="${C.prop}" stroke-width="2"/><rect x="28" y="91" width="32" height="5" rx="2" fill="${C.prop}"/><line x1="100" y1="78" x2="100" y2="104" stroke="${C.prop}" stroke-width="4" stroke-linecap="round"/>`, zones: [[[48, 56], [46, 70]]] },
  chestpress: { head: [50, 38], torso: [[50, 49], [50, 86]], legB: [[50, 86], [70, 86], [70, 108], [78, 108]], legF: [[50, 86], [72, 86], [72, 108], [80, 108]], armB: [[49, 52], [62, 60], [80, 54]], armF: [[51, 52], [66, 62], [84, 56]], props: `<line x1="41" y1="44" x2="42" y2="92" stroke="${C.prop}" stroke-width="5" stroke-linecap="round"/><rect x="40" y="89" width="34" height="5" rx="2" fill="${C.prop}"/>`, zones: [[[52, 52], [52, 64]]] },
  shoulder: { head: [52, 36], torso: [[52, 47], [52, 86]], legB: [[52, 86], [72, 86], [72, 108], [80, 108]], legF: [[52, 86], [74, 86], [74, 108], [82, 108]], armB: [[51, 49], [40, 36], [44, 16]], armF: [[53, 49], [64, 36], [60, 16]], props: db(44, 13) + db(60, 13) + `<rect x="42" y="89" width="34" height="5" rx="2" fill="${C.prop}"/>`, dots: [[52, 50]] },
  standPress: stand({ armB: [[59, 28], [48, 20], [54, 8]], armF: [[61, 28], [72, 20], [66, 8]], props: db(54, 7) + db(66, 7), dots: [[60, 29]] }),
  legcurl: { head: [48, 36], torso: [[48, 47], [46, 84]], legF: [[46, 84], [74, 84], [66, 106]], legB: [[46, 84], [72, 86], [64, 106]], armF: [[48, 50], [54, 66], [60, 82]], props: seat + `<circle cx="70" cy="108" r="5" fill="${C.prop}"/>`, zones: [[[48, 86], [72, 86]]] },
  legext: { head: [48, 36], torso: [[48, 47], [46, 84]], legF: [[46, 84], [72, 84], [96, 76]], legB: [[46, 84], [70, 86], [94, 78]], armF: [[48, 50], [52, 66], [56, 84]], props: seat + `<circle cx="98" cy="82" r="5" fill="${C.prop}"/>`, zones: [[[48, 82], [70, 82]]] },
  seat: { head: [48, 36], torso: [[48, 47], [46, 84]], legF: [[46, 84], [72, 84], [72, 106], [80, 106]], legB: [[46, 84], [70, 86], [70, 106], [78, 106]], armF: [[48, 50], [52, 66], [56, 84]], props: seat + `<line x1="38" y1="44" x2="38" y2="88" stroke="${C.prop}" stroke-width="5" stroke-linecap="round"/>`, dots: [[46, 82]], zones: [[[50, 86], [68, 86]]] },
  superman: { head: [100, 88], torso: [[90, 92], [54, 98]], legB: [[54, 98], [30, 100], [8, 98]], legF: [[54, 98], [30, 98], [8, 94]], armF: [[92, 94], [104, 84], [116, 80]], props: ground(104), zones: [[[70, 95], [56, 98]]], dots: [[52, 96]] },
  deadbug: { head: [14, 92], torso: [[24, 95], [58, 95]], legB: [[58, 95], [84, 90], [108, 88]], legF: [[58, 95], [60, 72], [80, 72]], armB: [[26, 95], [12, 82], [2, 72]], armF: [[27, 94], [27, 74], [27, 56]], props: ground(102), zones: [[[30, 93], [56, 93]]] },
  sideplank: { head: [98, 66], torso: [[88, 74], [52, 92]], legF: [[52, 92], [34, 100], [46, 106]], armF: [[88, 76], [88, 100], [102, 100]], props: ground(108), zones: [[[82, 78], [56, 90]]] },
  sideplankFull: { head: [100, 74], torso: [[90, 82], [54, 96]], legF: [[54, 96], [30, 103], [8, 108]], armF: [[90, 84], [90, 104], [104, 104]], props: ground(110), zones: [[[84, 85], [58, 94]]] },
  goblet: { head: [60, 38], torso: [[58, 49], [46, 78]], legB: [[46, 78], [66, 84], [58, 108], [67, 108]], legF: [[46, 78], [70, 82], [62, 108], [71, 108]], armF: [[58, 52], [68, 62], [66, 52]], props: db(66, 48), zones: [[[48, 78], [68, 82]]], dots: [[44, 80]] },
  squat: { head: [62, 40], torso: [[60, 51], [46, 78]], legB: [[46, 78], [66, 84], [58, 108], [67, 108]], legF: [[46, 78], [70, 82], [62, 108], [71, 108]], armF: [[60, 54], [76, 58], [90, 56]], zones: [[[48, 78], [68, 82]]], dots: [[44, 80]] },
  halfsquat: { head: [60, 30], torso: [[60, 41], [54, 70]], legF: [[54, 70], [66, 86], [62, 108], [70, 108]], legB: [[54, 70], [58, 88], [52, 108], [60, 108]], armF: [[60, 44], [64, 58], [70, 62]], props: loop(62, 86), dots: [[52, 70]] },
  backsquat: { head: [60, 38], torso: [[58, 49], [46, 78]], legB: [[46, 78], [66, 84], [58, 108], [67, 108]], legF: [[46, 78], [70, 82], [62, 108], [71, 108]], armF: [[58, 50], [48, 54], [52, 44]], props: plate(55, 46, 12), zones: [[[48, 78], [68, 82]]], dots: [[44, 80]] },
  deadlift: { head: [86, 38], torso: [[76, 44], [46, 66]], legB: [[46, 66], [60, 84], [54, 108], [62, 108]], legF: [[46, 66], [64, 82], [58, 108], [66, 108]], armF: [[74, 46], [70, 70], [66, 92]], props: plate(66, 95, 13), zones: [[[48, 68], [60, 82]], [[72, 46], [52, 62]]], dots: [[44, 64]] },
  lunge: { head: [58, 24], torso: [[58, 35], [58, 68]], legF: [[58, 68], [78, 84], [78, 108], [86, 108]], legB: [[58, 68], [46, 96], [28, 104], [24, 100]], armF: [[58, 38], [59, 54], [60, 70]], props: db(60, 72), zones: [[[60, 68], [78, 84]]], dots: [[56, 70]] },
  bulgarian: { head: [58, 24], torso: [[58, 35], [58, 68]], legF: [[58, 68], [78, 84], [78, 108], [86, 108]], legB: [[58, 68], [46, 94], [28, 88], [22, 84]], armF: [[58, 38], [59, 54], [60, 70]], props: `<rect x="4" y="88" width="30" height="20" rx="2" fill="${C.prop}"/>` + db(60, 72), zones: [[[60, 68], [78, 84]]], dots: [[56, 70]] },
  pushInc: { head: [96, 56], torso: [[86, 64], [50, 86]], legF: [[50, 86], [30, 96], [12, 106], [8, 108]], armF: [[86, 66], [92, 78], [94, 90]], props: `<rect x="82" y="92" width="30" height="16" rx="2" fill="${C.prop}"/>`, zones: [[[84, 66], [74, 71]]] },
  pushKnee: { head: [100, 82], torso: [[90, 88], [54, 96]], legF: [[54, 96], [34, 106], [46, 96]], armF: [[90, 90], [93, 99], [94, 108]], props: ground(110), zones: [[[88, 89], [78, 91]]] },
  pushFloor: { head: [100, 80], torso: [[90, 86], [52, 94]], legF: [[52, 94], [30, 100], [10, 106], [6, 108]], armF: [[90, 88], [93, 98], [94, 108]], props: ground(110), zones: [[[88, 87], [78, 89]]] },
  plank: { head: [100, 80], torso: [[90, 86], [52, 92]], legF: [[52, 92], [32, 98], [12, 104], [10, 108]], armF: [[90, 88], [90, 106], [104, 106]], props: ground(110), zones: [[[86, 87], [56, 92]]] },
  plankHigh: { head: [98, 64], torso: [[88, 70], [52, 84]], legF: [[52, 84], [32, 94], [12, 104], [8, 108]], armF: [[88, 72], [90, 90], [90, 108]], props: ground(110), zones: [[[84, 72], [56, 83]]] },
  climber: { head: [98, 64], torso: [[88, 70], [52, 84]], legF: [[52, 84], [32, 94], [12, 104], [8, 108]], legB: [[52, 84], [70, 94], [62, 106]], armF: [[88, 72], [90, 90], [90, 108]], props: ground(110), zones: [[[84, 72], [56, 83]]] },
  birddog: { head: [88, 54], torso: [[78, 62], [44, 62]], legB: [[44, 62], [44, 86], [22, 86]], legF: [[44, 62], [22, 58], [4, 56]], armB: [[78, 64], [78, 86]], armF: [[78, 62], [96, 52], [112, 46]], props: ground(90), zones: [[[70, 62], [48, 62]]] },
  bridge: { head: [14, 98], torso: [[24, 100], [58, 82]], legB: [[58, 82], [78, 74], [86, 104], [94, 106]], legF: [[58, 82], [80, 72], [88, 104], [96, 106]], armF: [[24, 102], [40, 106], [52, 106]], props: loop(79, 74) + ground(110), zones: [[[60, 82], [78, 74]]], dots: [[58, 84]] },
  bridgeSL: { head: [14, 98], torso: [[24, 100], [58, 82]], legB: [[58, 82], [78, 74], [86, 104], [94, 106]], legF: [[58, 82], [80, 66], [100, 52]], armF: [[24, 102], [40, 106], [52, 106]], props: ground(110), zones: [[[60, 82], [77, 75]]], dots: [[58, 84]] },
  hipthrust: { head: [18, 64], torso: [[28, 72], [64, 72]], legB: [[64, 72], [82, 76], [86, 106], [94, 106]], legF: [[64, 72], [84, 76], [88, 106], [96, 106]], armF: [[30, 74], [44, 70], [58, 66]], props: `<rect x="2" y="74" width="30" height="34" rx="2" fill="${C.prop}"/>` + db(60, 65), zones: [[[66, 72], [82, 76]]], dots: [[64, 75]] },
  hipthrustBB: { head: [18, 64], torso: [[28, 72], [64, 72]], legB: [[64, 72], [82, 76], [86, 106], [94, 106]], legF: [[64, 72], [84, 76], [88, 106], [96, 106]], armF: [[30, 74], [44, 70], [58, 62]], props: `<rect x="2" y="74" width="30" height="34" rx="2" fill="${C.prop}"/>` + plate(62, 58, 13), zones: [[[66, 72], [82, 76]]], dots: [[64, 75]] },
  row1: { head: [98, 46], torso: [[88, 52], [54, 58]], legF: [[54, 58], [48, 84], [46, 108], [54, 108]], legB: [[54, 58], [66, 70], [88, 70]], armB: [[86, 54], [88, 72]], armF: [[88, 54], [76, 44], [80, 62]], props: `<rect x="60" y="73" width="40" height="5" rx="2" fill="${C.prop}"/><line x1="64" y1="78" x2="64" y2="108" stroke="${C.prop}" stroke-width="3"/><line x1="96" y1="78" x2="96" y2="108" stroke="${C.prop}" stroke-width="3"/>` + db(80, 64), zones: [[[84, 53], [70, 55]]] },
  pullapart: stand({ armB: [[59, 29], [76, 32], [92, 32]], armF: [[61, 29], [78, 30], [94, 30]], props: `<line x1="92" y1="31" x2="96" y2="31" stroke="${C.band}" stroke-width="4"/>`, dots: [[58, 32]] }),
  facepull: stand({ armF: [[61, 29], [54, 18], [72, 16]], props: `<line x1="72" y1="16" x2="118" y2="20" stroke="${C.prop}" stroke-width="2"/>`, dots: [[58, 30]] }),
  pallof: stand({ armB: [[59, 30], [72, 40], [86, 40]], armF: [[61, 30], [74, 38], [88, 38]], props: `<line x1="88" y1="38" x2="118" y2="30" stroke="${C.prop}" stroke-width="2"/>`, zones: [[[60, 34], [60, 56]]] }),
  curl: stand({ armF: [[61, 29], [62, 46], [74, 36]], props: db(75, 34), zones: [[[61, 31], [62, 44]]] }),
  kickback: { head: [88, 32], torso: [[78, 40], [54, 62]], legB: [[54, 62], [58, 86], [56, 108], [64, 108]], legF: [[54, 62], [62, 86], [60, 108], [68, 108]], armB: [[76, 42], [74, 58], [70, 72]], armF: [[76, 42], [62, 50], [44, 52]], props: db(42, 52), zones: [[[75, 43], [63, 50]]] },
  pullupAss: { head: [60, 30], torso: [[60, 40], [60, 72]], armF: [[61, 42], [70, 24], [66, 6]], armB: [[59, 42], [50, 24], [54, 6]], legF: [[60, 72], [74, 92], [60, 104]], legB: [[60, 72], [72, 94], [58, 106]], props: `<line x1="30" y1="6" x2="90" y2="6" stroke="${C.prop}" stroke-width="4" stroke-linecap="round"/><rect x="62" y="96" width="24" height="6" rx="2" fill="${C.prop}"/>`, zones: [[[60, 44], [60, 60]]] },
  dbBench: { head: [16, 68], torso: [[26, 70], [66, 72]], legF: [[66, 72], [84, 78], [88, 104], [96, 104]], legB: [[66, 72], [82, 80], [84, 104], [92, 104]], armB: [[34, 70], [36, 52], [38, 36]], armF: [[32, 70], [30, 52], [34, 36]], props: `<rect x="14" y="76" width="64" height="6" rx="2" fill="${C.prop}"/><line x1="24" y1="82" x2="24" y2="106" stroke="${C.prop}" stroke-width="3"/><line x1="70" y1="82" x2="70" y2="106" stroke="${C.prop}" stroke-width="3"/>` + db(36, 34), zones: [[[30, 70], [42, 70]]] }
};

function sketch(k) {
  const p = POSES[k] || POSES.squat;
  const line = (pts, col, w) => `<polyline points="${pts.map(q => q.join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let s = `<svg viewBox="0 0 120 120" aria-hidden="true">` + (p.props || "");
  ["legB", "armB"].forEach(x => { if (p[x]) s += line(p[x], C.back, 7); });
  s += line(p.torso, C.limb, 11);
  ["legF", "armF"].forEach(x => { if (p[x]) s += line(p[x], C.limb, 7); });
  (p.zones || []).forEach(z => s += line(z, C.hl, 7));
  (p.dots || []).forEach(d => s += `<circle cx="${d[0]}" cy="${d[1]}" r="6" fill="${C.hl}"/>`);
  return s + `<circle cx="${p.head[0]}" cy="${p.head[1]}" r="7.5" fill="${C.limb}"/></svg>`;
}

// ---------- Übungen ----------
// eq: "kg" = Gewicht wird eingetragen, "bw" = nur Wiederholungen, "sec" = Sekunden
const EX = {};
function ex(id, n, pose, eq, p, s, cues, easier, harder, extra) {
  EX[id] = Object.assign({ id, n, pose, eq, p, s, cues, easier, harder }, extra || {});
}
ex("legpress", "Beinpresse liegend", "legpress", "kg", ["Vorderseite Oberschenkel", "Gesäß"], ["Rückseite Oberschenkel"],
  ["Füße hüftbreit mittig auf die Platte.", "Knie zeigen in Richtung der Zehen, nicht nach innen.", "Nur so tief, wie der untere Rücken am Polster bleibt."], "weniger Gewicht, kleinere Bewegung", "langsam in 3 Sekunden absenken");
ex("pulldown", "Latzug", "pulldown", "kg", ["Breiter Rückenmuskel"], ["Bizeps", "hintere Schulter"],
  ["Griff etwas breiter als schulterbreit, Brust leicht anheben.", "Stange zur oberen Brust ziehen, Ellbogen zeigen nach unten.", "Langsam zurück, Schultern bleiben weg von den Ohren."], "enger Griff", "unten 1 Sekunde halten");
ex("rdl", "Rumänisches Kreuzheben mit Kurzhanteln", "rdlB", "kg", ["Rückseite Oberschenkel", "Gesäß"], ["unterer Rücken", "Griffkraft"],
  ["Knie leicht gebeugt, Po nach hinten schieben, als wolltest du mit dem Po eine Tür zumachen.", "Rücken bleibt lang und gerade, Hanteln gleiten eng an den Beinen nach unten.", "Wenn du hinten im Oberschenkel Zug spürst: Gesäß anspannen und aufrichten."], "ohne Gewicht, Hände an der Hüfte", "mit der Langhantel (Etappe 3)", { start: "rdlT" });
ex("rdlBB", "Rumänisches Kreuzheben mit Langhantel", "rdlBB", "kg", ["Rückseite Oberschenkel", "Gesäß"], ["unterer Rücken", "Griffkraft"],
  ["Stange schulterbreit greifen und nah am Körper halten.", "Po nach hinten, bis du hinten im Oberschenkel deutlich Zug spürst.", "Rücken gerade, Gesäß anspannen beim Aufrichten."], "mit Kurzhanteln", "langsam in 3 Sekunden absenken", { start: "rdlT" });
ex("chestpress", "Brustpresse an der Maschine", "chestpress", "kg", ["Brust"], ["Trizeps", "vordere Schulter"],
  ["Sitz so einstellen, dass die Griffe auf Brusthöhe sind.", "Schulterblätter zusammen und nach unten ziehen.", "Beim Drücken ausatmen, Arme nicht ganz durchstrecken."], "weniger Gewicht", "langsam zurückführen");
ex("rowMach", "Rudern an der Maschine", "row", "kg", ["Oberer Rücken"], ["hintere Schulter", "Bizeps"],
  ["Aufrecht sitzen, Brust raus.", "Ellbogen eng am Körper nach hinten ziehen.", "Schulterblätter zusammen und kurz halten."], "weniger Gewicht", "2 Sekunden halten");
ex("cableRow", "Rudern am Kabelzug", "row", "kg", ["Oberer Rücken", "Breiter Rückenmuskel"], ["Bizeps", "hintere Schulter"],
  ["Aufrecht sitzen, Knie leicht gebeugt.", "Griff zum Bauchnabel ziehen, Ellbogen nah am Körper.", "Nicht mit dem Oberkörper schwingen."], "Rudern an der Maschine", "einarmig");
ex("cableRow1", "Einarmiges Rudern am Kabel", "row", "kg", ["Breiter Rückenmuskel", "oberer Rücken"], ["Bizeps", "Rumpf"],
  ["Stabil sitzen oder in Schrittstellung stehen.", "Ellbogen nach hinten an der Hüfte vorbeiziehen.", "Der Oberkörper dreht nicht mit."], "beidarmig", "unten 2 Sekunden halten");
ex("shoulderSeat", "Schulterdrücken sitzend", "shoulder", "kg", ["Schultern"], ["Trizeps", "oberer Rücken"],
  ["Rücken fest an die Lehne.", "Hanteln auf Ohrhöhe starten und nach oben drücken.", "Bauch fest, kein Hohlkreuz."], "leichtere Hanteln", "stehend");
ex("standPress", "Schulterdrücken stehend", "standPress", "kg", ["Schultern"], ["Trizeps", "Rumpf"],
  ["Hüftbreit stehen, Po und Bauch anspannen.", "Hanteln von Ohrhöhe gerade nach oben drücken.", "Nicht ins Hohlkreuz ausweichen."], "im Sitzen", "einarmig, die andere Hand an der Hüfte");
ex("legcurl", "Beinbeuger (Leg Curl)", "legcurl", "kg", ["Rückseite Oberschenkel"], ["Waden"],
  ["Knie auf Höhe der Drehachse einstellen.", "Polster knapp über der Ferse.", "Langsam zurück, das Gewicht nicht fallen lassen."], "weniger Gewicht", "langsam in 3 Sekunden zurück");
ex("legext", "Beinstrecker (Leg Extension)", "legext", "kg", ["Vorderseite Oberschenkel"], [],
  ["Knie auf Höhe der Drehachse.", "Oben kurz halten.", "Langsam ablassen."], "weniger Gewicht", "oben 2 Sekunden halten");
ex("backext", "Rückenstrecker (Hyperextension)", "superman", "bw", ["Unterer Rücken"], ["Gesäß", "Rückseite Oberschenkel"],
  ["Hüfte liegt am Polster, Hände vor der Brust.", "Nur bis zur geraden Linie hochkommen, nicht überstrecken.", "Ruhig und ohne Schwung."], "kleinere Bewegung", "eine Hantelscheibe vor der Brust");
ex("superman", "Superman", "superman", "bw", ["Unterer Rücken"], ["Gesäß", "Schultern"],
  ["Bauchlage, Blick zum Boden.", "Arme und Beine gleichzeitig leicht anheben.", "2 Sekunden halten, langsam ablegen."], "nur Arme oder nur Beine", "3 Sekunden halten");
ex("deadbug", "Dead Bug", "deadbug", "bw", ["Tiefe Bauchmuskulatur"], ["Hüftbeuger"],
  ["Rückenlage, Beine im 90-Grad-Winkel, Arme zur Decke.", "Gegenüberliegenden Arm und Bein langsam lang machen.", "Der untere Rücken bleibt die ganze Zeit am Boden."], "nur die Beine bewegen", "langsamer, ganz gestreckt");
ex("sideplankKnee", "Seitstütz auf den Knien", "sideplank", "sec", ["Seitliche Bauchmuskeln"], ["Schulter", "Gesäß"],
  ["Ellbogen genau unter der Schulter.", "Hüfte hoch, von Knie bis Kopf eine Linie.", "Ruhig weiteratmen."], "kürzer halten", "Beine gestreckt");
ex("sideplank", "Seitstütz", "sideplankFull", "sec", ["Seitliche Bauchmuskeln"], ["Schulter", "Gesäß"],
  ["Ellbogen unter der Schulter, Beine gestreckt.", "Hüfte hoch, der Körper bildet eine Linie.", "Ruhig weiteratmen."], "auf den Knien", "oberes Bein anheben");
ex("goblet", "Goblet Squat", "goblet", "kg", ["Vorderseite Oberschenkel", "Gesäß"], ["Rumpf"],
  ["Hantel senkrecht vor der Brust halten.", "Po nach hinten unten, Knie wandern über die Zehen.", "Brust bleibt aufrecht, Fersen bleiben am Boden."], "ohne Gewicht", "unten 2 Sekunden halten");
ex("squatBW", "Kniebeuge", "squat", "bw", ["Vorderseite Oberschenkel", "Gesäß"], ["Rumpf"],
  ["Füße etwas breiter als hüftbreit.", "Po nach hinten unten, Arme nach vorne.", "Über die ganze Fußsohle hochdrücken."], "auf einen Stuhl setzen und wieder aufstehen", "mit Hantel");
ex("hipthrust", "Hip Thrust an der Bank", "hipthrust", "kg", ["Gesäß"], ["Rückseite Oberschenkel"],
  ["Schulterblätter an der Bankkante, Hantel auf der Hüfte.", "Hüfte hochdrücken, bis Knie, Hüfte und Schultern eine Linie bilden.", "Oben das Gesäß 1 Sekunde fest anspannen."], "ohne Gewicht", "mit Langhantel (Etappe 3)");
ex("hipthrustBB", "Hip Thrust mit Langhantel", "hipthrustBB", "kg", ["Gesäß"], ["Rückseite Oberschenkel"],
  ["Stange mit Polster auf die Hüfte legen.", "Füße so stellen, dass die Schienbeine oben senkrecht sind.", "Kinn leicht zur Brust, oben kurz halten."], "mit Kurzhantel", "oben 2 Sekunden halten");
ex("facepull", "Face Pull am Kabel", "facepull", "kg", ["Hintere Schulter", "oberer Rücken"], ["Schulterstabilität"],
  ["Seil auf Augenhöhe einstellen.", "Zum Gesicht ziehen, Ellbogen hoch und nach außen.", "Kurz halten, langsam zurück."], "weniger Gewicht", "2 Sekunden halten");
ex("pallof", "Pallof Press", "pallof", "kg", ["Rumpf"], ["Schultern"],
  ["Seitlich zum Kabel stehen, Griff an der Brust.", "Arme gerade nach vorne drücken, ohne dich mitzudrehen.", "2 Sekunden halten, zurück. Beide Seiten."], "weniger Gewicht", "länger halten");
ex("splitDB", "Split Squat mit Kurzhanteln", "lunge", "kg", ["Vorderseite Oberschenkel", "Gesäß"], ["Gleichgewicht"],
  ["Großer Schritt, beide Füße bleiben stehen.", "Hinteres Knie senkrecht Richtung Boden senken.", "Über die vordere Ferse wieder hochdrücken."], "ohne Gewicht, an der Wand abstützen", "hinterer Fuß erhöht");
ex("bulgarian", "Bulgarian Split Squat", "bulgarian", "kg", ["Vorderseite Oberschenkel", "Gesäß"], ["Rumpf", "Gleichgewicht"],
  ["Hinterer Fuß auf Bank oder Sofa.", "Das vordere Bein trägt, senkrecht nach unten gehen.", "Oberkörper leicht nach vorne geneigt."], "Split Squat am Boden", "Hanteln in beiden Händen");
ex("dbBench", "Bankdrücken mit Kurzhanteln", "dbBench", "kg", ["Brust"], ["Trizeps", "vordere Schulter"],
  ["Füße fest am Boden, Schulterblätter zusammen.", "Hanteln über der Brust nach oben drücken.", "Langsam absenken, bis die Ellbogen etwa auf Bankhöhe sind."], "Brustpresse an der Maschine", "langsam in 3 Sekunden absenken");
ex("backsquat", "Kniebeuge mit Langhantel", "backsquat", "kg", ["Vorderseite Oberschenkel", "Gesäß"], ["Rücken", "Rumpf"],
  ["Stange auf dem oberen Rücken, nicht im Nacken.", "Tief einatmen, Bauch fest, dann nach unten setzen.", "Knie folgen den Zehen, Rücken bleibt gerade."], "Goblet Squat", "unten 1 Sekunde halten");
ex("deadlift", "Kreuzheben (Langhantel oder Trap Bar)", "deadlift", "kg", ["Gesäß", "Rückseite Oberschenkel", "unterer Rücken"], ["Vorderseite Oberschenkel", "Griffkraft"],
  ["Stange über der Fußmitte, Schienbeine nah dran.", "Rücken gerade, Brust raus, dann mit den Beinen den Boden wegdrücken.", "Stange bleibt nah am Körper, oben aufrecht stehen ohne Hohlkreuz."], "Rumänisches Kreuzheben", "Pause kurz über dem Boden");
ex("pullupAss", "Klimmzug mit Unterstützung", "pullupAss", "kg", ["Breiter Rückenmuskel"], ["Bizeps", "Rumpf"],
  ["Knie auf das Polster, Hände schulterbreit.", "Brust zur Stange ziehen, Schultern weg von den Ohren.", "Langsam ganz nach unten. Hier zählt: weniger Kilo Unterstützung ist schwerer."], "mehr Unterstützung", "weniger Unterstützung");
ex("abduct", "Abduktoren-Maschine", "seat", "kg", ["Seitliches Gesäß"], [],
  ["Rücken an die Lehne.", "Beine kontrolliert nach außen drücken.", "Langsam zurück."], "weniger Gewicht", "außen 1 Sekunde halten");
ex("adduct", "Adduktoren-Maschine", "seat", "kg", ["Innenseite Oberschenkel"], [],
  ["Rücken an die Lehne.", "Beine kontrolliert zusammendrücken.", "Langsam zurück."], "weniger Gewicht", "innen 1 Sekunde halten");
ex("pushInc", "Liegestütz erhöht", "pushInc", "bw", ["Brust"], ["Trizeps", "Schultern", "Rumpf"],
  ["Hände auf Sofa, Bank oder Tisch, schulterbreit.", "Körper bildet eine Linie von Kopf bis Fuß.", "Brust zur Kante senken, kräftig wegdrücken."], "höhere Unterlage", "niedrigere Unterlage");
ex("pushKnee", "Liegestütz auf den Knien", "pushKnee", "bw", ["Brust"], ["Trizeps", "Schultern", "Rumpf"],
  ["Hände etwas breiter als die Schultern.", "Von Knie bis Kopf eine Linie, Po nicht hochstrecken.", "Brust Richtung Boden, beim Hochdrücken ausatmen."], "erhöht an Sofa oder Bank", "Liegestütz auf den Füßen");
ex("pushFloor", "Liegestütz", "pushFloor", "bw", ["Brust"], ["Trizeps", "Schultern", "Rumpf"],
  ["Hände unter den Schultern, Körper eine Linie.", "Ellbogen zeigen schräg nach hinten.", "Brust fast bis zum Boden, kräftig hochdrücken."], "auf den Knien", "langsam in 3 Sekunden absenken");
ex("row1", "Einarmiges Rudern mit Kurzhantel", "row1", "kg", ["Breiter Rückenmuskel", "oberer Rücken"], ["Bizeps"],
  ["Hand und Knie auf Bank, Stuhl oder Sofa stützen.", "Hantel zur Hüfte ziehen, Ellbogen nah am Körper.", "Rücken bleibt gerade, nicht aufdrehen."], "Rudern mit Theraband", "oben 2 Sekunden halten");
ex("bridgeLoop", "Glute Bridge mit Hip-Loop", "bridge", "bw", ["Gesäß"], ["Rückseite Oberschenkel", "seitliches Gesäß"],
  ["Band über den Knien, Füße hüftbreit aufgestellt.", "Hüfte hochdrücken, Knie leicht gegen das Band nach außen.", "Oben 2 Sekunden halten."], "ohne Band", "einbeinig");
ex("bridgeSL", "Einbeinige Glute Bridge", "bridgeSL", "bw", ["Gesäß"], ["Rückseite Oberschenkel", "Rumpf"],
  ["Ein Bein gestreckt in der Luft.", "Über die Ferse des Standbeins hochdrücken.", "Das Becken bleibt gerade und kippt nicht."], "beidbeinig mit Band", "Schultern auf dem Sofa");
ex("plank", "Unterarmstütz", "plank", "sec", ["Gerade Bauchmuskeln", "tiefer Rumpf"], ["Schultern", "Gesäß"],
  ["Ellbogen unter den Schultern.", "Po und Bauch fest, kein Durchhängen.", "Lieber kürzer und sauber als lang und krumm."], "auf den Knien", "ein Bein leicht anheben");
ex("plankTaps", "Schulter-Tippen im Stütz", "plankHigh", "bw", ["Rumpf"], ["Schultern"],
  ["Hoher Stütz, Füße etwas breiter als hüftbreit.", "Abwechselnd mit einer Hand die andere Schulter antippen.", "Die Hüfte bleibt ruhig, kein Schaukeln."], "auf den Knien", "Füße enger");
ex("climber", "Bergsteiger, langsam", "climber", "sec", ["Rumpf"], ["Hüftbeuger", "Schultern"],
  ["Hoher Stütz, Hände unter den Schultern.", "Abwechselnd ein Knie zur Brust ziehen.", "Ruhig und kontrolliert, der Po bleibt unten."], "Hände erhöht", "etwas schneller");
ex("lungeRev", "Ausfallschritt rückwärts", "lunge", "kg", ["Vorderseite Oberschenkel", "Gesäß"], ["Gleichgewicht"],
  ["Aufrecht stehen, ein Bein großen Schritt nach hinten.", "Hinteres Knie Richtung Boden, vorderes Knie über dem Fuß.", "Über die vordere Ferse zurück in den Stand."], "ohne Gewicht, an der Wand abstützen", "mit 5-kg-Hanteln");
ex("bandPull", "Band Pull-Apart", "pullapart", "bw", ["Hintere Schulter", "oberer Rücken"], [],
  ["Theraband schulterbreit greifen, Arme vor der Brust.", "Band auseinanderziehen, bis es die Brust berührt.", "Schulterblätter zusammen, langsam zurück."], "Hände weiter auseinander", "Hände enger greifen");
ex("bandRow", "Rudern mit Theraband", "row", "bw", ["Oberer Rücken"], ["Bizeps", "hintere Schulter"],
  ["Im Sitzen das Band um die Füße legen.", "Enden zum Bauch ziehen, Ellbogen nah am Körper.", "Schulterblätter zusammen, langsam zurück."], "Band lockerer", "Band kürzer greifen");
ex("curl", "Bizeps-Curl", "curl", "kg", ["Bizeps"], ["Unterarme"],
  ["Ellbogen bleiben seitlich am Körper.", "Hanteln ohne Schwung hochführen.", "Langsam ablassen."], "abwechselnd", "langsam in 3 Sekunden ablassen");
ex("kickback", "Trizeps-Kickback", "kickback", "kg", ["Trizeps"], [],
  ["Leicht nach vorne beugen, Oberarm eng am Körper.", "Unterarm nach hinten strecken, bis der Arm gerade ist.", "Nur der Unterarm bewegt sich."], "einarmig mit Abstützen", "oben 1 Sekunde halten");
ex("birddog", "Bird Dog", "birddog", "bw", ["Unterer Rücken", "tiefer Rumpf"], ["Gesäß", "Schultern"],
  ["Vierfüßlerstand, Rücken gerade wie ein Tisch.", "Gegenüberliegenden Arm und Bein lang machen.", "2 Sekunden halten, das Becken bleibt gerade."], "nur ein Bein strecken", "3 Sekunden halten");
ex("monster", "Seitschritte mit Hip-Loop", "halfsquat", "bw", ["Seitliches Gesäß"], ["Oberschenkel"],
  ["Band über den Knien, leicht in die Knie gehen.", "Kleine Schritte zur Seite, das Band bleibt gespannt.", "Oberkörper bleibt ruhig."], "Band über den Knien", "Band an den Knöcheln");

// ---------- Etappen und Pläne ----------
// Eintrag: [Übung, Sätze, Wdh. von, Wdh. bis, je Seite]
const STAGES = [
  null,
  { n: "Fundament", weeks: "Woche 1–6", goal: "Geräte sicher nutzen, die Hüftbeuge lernen und einen festen Rhythmus finden." },
  { n: "Aufbau", weeks: "Woche 7–12", goal: "Erste Übungen am Kabelzug, Hip Thrust und etwas mehr Gewicht." },
  { n: "Kraft", weeks: "Woche 13–18", goal: "Grundübungen mit freien Gewichten wie Langhantel und Split Squat." },
  { n: "Freiraum", weeks: "ab Woche 19", goal: "Die großen Grundübungen: Kniebeuge, Kreuzheben und Klimmzug mit Hilfe." }
];
const TYPES = {
  gym: { t: "Gym Ganzkörper", s: "Gym", dur: "60–70 min", rest: 90 },
  A: { t: "Zuhause A", s: "A", dur: "30 min", rest: 60 },
  B: { t: "Zuhause B", s: "B", dur: "30 min", rest: 60 },
  C: { t: "Zuhause C", s: "C", dur: "20 min", rest: 20, opt: true }
};
const WARM = {
  gym: "Aufwärmen: 5 Minuten locker auf Rudergerät oder Crosstrainer, dann 10 Kniebeugen und 10 Armkreise.",
  home: "Aufwärmen: 3 Minuten auf der Stelle marschieren, Arme kreisen, 10 Kniebeugen."
};
const circuit = (rounds, sec) => ({
  focus: `Zirkel ohne Geräte: ${sec} Sekunden Arbeit, ${60 - sec} Sekunden Pause, ${rounds} Runden.`,
  blocks: [{ l: `${rounds} Runden im Wechsel`, it: [["squatBW", rounds, sec, sec], ["pushKnee", rounds, sec, sec], ["superman", rounds, sec, sec], ["climber", rounds, sec, sec], ["bridgeLoop", rounds, sec, sec], ["deadbug", rounds, sec, sec]] }],
  timed: true
});
const PLAN = {
  1: {
    gym: { focus: "Ganzkörper an Geräten, dazu die erste Übung mit Kurzhanteln.", blocks: [
      { l: "Block A · im Wechsel", it: [["legpress", 3, 10, 12], ["pulldown", 3, 10, 12]] },
      { l: "Block B · im Wechsel", it: [["rdl", 3, 10, 12], ["chestpress", 3, 10, 12]] },
      { l: "Block C · im Wechsel", it: [["rowMach", 3, 10, 12], ["shoulderSeat", 3, 8, 10]] },
      { l: "Block D · im Wechsel", it: [["legcurl", 2, 12, 15], ["backext", 2, 10, 12]] },
      { l: "Core zum Schluss", it: [["deadbug", 2, 6, 8, 1], ["sideplankKnee", 2, 20, 30, 1]] }],
      extra: [["abduct", 2, 15, 15], ["adduct", 2, 15, 15]] },
    A: { focus: "Beine, Brust und Rücken mit deinen 5-kg-Hanteln.", blocks: [
      { l: "Block A · im Wechsel", it: [["goblet", 3, 10, 15], ["pushInc", 3, 6, 10]] },
      { l: "Block B · im Wechsel", it: [["row1", 3, 10, 12, 1], ["bridgeLoop", 3, 12, 20]] },
      { l: "Core zum Schluss", it: [["plank", 3, 20, 40]] }] },
    B: { focus: "Beine, Schultern, Arme und unterer Rücken.", blocks: [
      { l: "Block A · im Wechsel", it: [["lungeRev", 3, 6, 10, 1], ["standPress", 3, 10, 15]] },
      { l: "Block B · im Wechsel", it: [["rdl", 3, 10, 15], ["bandPull", 3, 12, 20]] },
      { l: "Block C · Arme", it: [["curl", 2, 10, 15], ["kickback", 2, 10, 15]] },
      { l: "Core zum Schluss", it: [["birddog", 2, 6, 8, 1]] }] },
    C: circuit(3, 40)
  },
  2: {
    gym: { focus: "Jetzt kommen Kabelzug und Hip Thrust dazu.", blocks: [
      { l: "Block A · im Wechsel", it: [["legpress", 3, 8, 12], ["pulldown", 3, 8, 12]] },
      { l: "Block B · im Wechsel", it: [["hipthrust", 3, 10, 12], ["cableRow", 3, 10, 12]] },
      { l: "Block C · im Wechsel", it: [["goblet", 3, 8, 12], ["chestpress", 3, 8, 12]] },
      { l: "Block D · im Wechsel", it: [["legcurl", 2, 10, 12], ["facepull", 2, 12, 15]] },
      { l: "Core zum Schluss", it: [["pallof", 2, 10, 12, 1], ["sideplankKnee", 2, 30, 40, 1]] }],
      extra: [["abduct", 2, 15, 15], ["adduct", 2, 15, 15]] },
    A: { focus: "Langsamer und einbeinig: mehr Reiz mit denselben Hanteln.", blocks: [
      { l: "Block A · im Wechsel", it: [["goblet", 3, 10, 15], ["pushKnee", 3, 6, 10]] },
      { l: "Block B · im Wechsel", it: [["row1", 3, 12, 15, 1], ["bridgeSL", 3, 8, 12, 1]] },
      { l: "Core zum Schluss", it: [["plankTaps", 3, 8, 12, 1]] }] },
    B: { focus: "Split Squat, Schultern, Rücken und Arme.", blocks: [
      { l: "Block A · im Wechsel", it: [["splitDB", 3, 8, 12, 1], ["standPress", 3, 10, 15]] },
      { l: "Block B · im Wechsel", it: [["rdl", 3, 12, 15], ["bandRow", 3, 12, 15]] },
      { l: "Block C · Arme", it: [["curl", 2, 10, 15], ["kickback", 2, 10, 15]] },
      { l: "Core zum Schluss", it: [["sideplank", 2, 15, 30, 1], ["monster", 2, 10, 12, 1]] }] },
    C: circuit(4, 40)
  },
  3: {
    gym: { focus: "Freie Gewichte: Langhantel und einbeinige Kraft.", blocks: [
      { l: "Block A · im Wechsel", it: [["hipthrustBB", 3, 8, 10], ["pulldown", 3, 8, 10]] },
      { l: "Block B · im Wechsel", it: [["rdlBB", 3, 8, 10], ["dbBench", 3, 8, 10]] },
      { l: "Block C · im Wechsel", it: [["bulgarian", 3, 8, 10, 1], ["cableRow1", 3, 10, 12, 1]] },
      { l: "Block D · im Wechsel", it: [["legpress", 2, 10, 12], ["facepull", 2, 12, 15]] },
      { l: "Core zum Schluss", it: [["pallof", 3, 10, 12, 1], ["deadbug", 2, 8, 10, 1]] }] },
    A: { focus: "Einbeinig und mit mehr Spannung.", blocks: [
      { l: "Block A · im Wechsel", it: [["bulgarian", 3, 8, 12, 1], ["pushKnee", 3, 8, 12]] },
      { l: "Block B · im Wechsel", it: [["row1", 3, 12, 15, 1], ["bridgeSL", 3, 10, 15, 1]] },
      { l: "Core zum Schluss", it: [["plank", 3, 30, 45]] }] },
    B: { focus: "Beine, Schultern und Rücken mit kurzen Pausen.", blocks: [
      { l: "Block A · im Wechsel", it: [["lungeRev", 3, 10, 12, 1], ["standPress", 3, 12, 15]] },
      { l: "Block B · im Wechsel", it: [["rdl", 3, 12, 15], ["bandPull", 3, 15, 20]] },
      { l: "Block C · Arme", it: [["curl", 3, 10, 15], ["kickback", 3, 10, 15]] },
      { l: "Core zum Schluss", it: [["sideplank", 2, 20, 40, 1]] }] },
    C: circuit(4, 45)
  },
  4: {
    gym: { focus: "Die großen Grundübungen.", blocks: [
      { l: "Block A · im Wechsel", it: [["backsquat", 3, 6, 8], ["pullupAss", 3, 6, 8]] },
      { l: "Block B · im Wechsel", it: [["deadlift", 3, 5, 6], ["dbBench", 3, 8, 10]] },
      { l: "Block C · im Wechsel", it: [["hipthrustBB", 3, 8, 10], ["cableRow", 3, 8, 10]] },
      { l: "Block D · im Wechsel", it: [["standPress", 2, 8, 10], ["legcurl", 2, 10, 12]] },
      { l: "Core zum Schluss", it: [["pallof", 2, 10, 12, 1], ["sideplank", 2, 30, 45, 1]] }] },
    A: { focus: "Kraft zuhause: Liegestütz auf den Füßen.", blocks: [
      { l: "Block A · im Wechsel", it: [["goblet", 3, 12, 15], ["pushFloor", 3, 5, 10]] },
      { l: "Block B · im Wechsel", it: [["row1", 3, 12, 15, 1], ["bulgarian", 3, 8, 12, 1]] },
      { l: "Core zum Schluss", it: [["plankTaps", 3, 10, 16, 1]] }] },
    B: { focus: "Beine, Schultern, Rücken und Arme.", blocks: [
      { l: "Block A · im Wechsel", it: [["splitDB", 3, 10, 12, 1], ["standPress", 3, 12, 15]] },
      { l: "Block B · im Wechsel", it: [["rdl", 3, 12, 15], ["bandRow", 3, 15, 20]] },
      { l: "Block C · Arme", it: [["curl", 3, 10, 15], ["kickback", 3, 10, 15]] },
      { l: "Core zum Schluss", it: [["birddog", 2, 8, 10, 1], ["monster", 2, 12, 15, 1]] }] },
    C: circuit(4, 45)
  }
};
