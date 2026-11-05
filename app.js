/* Café La Dolce Gera — demo site logic (front-end only, no backend, no data stored) */
const BUSINESS_NAME = "Café La Dolce Gera";

const CAKES = {
  "schokotorte": "Schokotorte",
  "cheesecake": "Cheesecake New York",
  "schwarzwaelder": "Schwarzwälder Kirschtorte",
  "milchmaedchen": "Milchmädchen mit Himbeeren",
  "honigtorte": "Honigtorte",
  "redvelvet": "Red Velvet",
  "vanille-apfel": "Vanille-Apfel-Kuchen",
  "napoleon": "Napoleon",
  "schoko-himbeer": "Schoko-Himbeer-Torte",
  "raffaello": "Raffaello-Torte"
};

document.querySelectorAll("[data-business-name]").forEach(el => { el.textContent = BUSINESS_NAME; });
document.title = document.title.replace(/Café La Dolce Gera/g, BUSINESS_NAME);

function genCode(prefix) {
  const n = String(Math.floor(100 + Math.random() * 900));
  return "#" + prefix + "-" + new Date().getFullYear() + "-" + n;
}
function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val + "T12:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function nowTime() {
  return new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}
function requiredOk(ids) {
  let ok = true;
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) { el.style.borderColor = "#9E2B38"; ok = false; }
    else if (el) { el.style.borderColor = ""; }
  });
  return ok;
}

/* ---------- tabs ---------- */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const group = tab.closest("section, div");
    tab.parentElement.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const pane = document.getElementById("tab-" + tab.dataset.tab);
    if (pane) {
      pane.parentElement.querySelectorAll(".tabpane").forEach(p => p.classList.remove("active"));
      pane.classList.add("active");
    }
  });
});

/* ---------- hero order bar ---------- */
const heroBar = document.getElementById("heroOrderBar");
if (heroBar) {
  heroBar.addEventListener("submit", e => {
    e.preventDefault();
    const cake = document.getElementById("hbCake").value;
    const date = document.getElementById("hbDate").value;
    const url = "vorbestellen.html?torte=" + encodeURIComponent(cake) + (date ? "&date=" + encodeURIComponent(date) : "");
    window.location.href = url;
  });
}

/* ---------- pre-order flow ---------- */
const orderForm = document.getElementById("orderForm");
if (orderForm) {
  let selectedCake = "milchmaedchen";
  let selectedSlot = "14:00 – 16:00 Uhr";
  let confirmChannel = "WhatsApp";

  const params = new URLSearchParams(window.location.search);
  const preCake = params.get("torte");
  const preDate = params.get("date");
  if (preCake && CAKES[preCake]) selectedCake = preCake;
  if (preDate) { const pd = document.getElementById("pickupDate"); if (pd) pd.value = preDate; }

  const tiles = document.querySelectorAll(".cake-tile");
  function renderCake() {
    tiles.forEach(t => {
      const on = t.dataset.cake === selectedCake;
      t.classList.toggle("selected", on);
      t.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const name = CAKES[selectedCake];
    document.getElementById("chosenCake").textContent = name;
    document.getElementById("sumCake").textContent = name;
    document.getElementById("sumCake3").textContent = name;
  }
  tiles.forEach(t => t.addEventListener("click", () => { selectedCake = t.dataset.cake; renderCake(); }));
  renderCake();

  document.querySelectorAll("#sizeCards .radio-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll("#sizeCards .radio-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      card.querySelector("input").checked = true;
      const v = card.querySelector("input").value;
      document.getElementById("sumSize").textContent = v;
      document.getElementById("sumSize3").textContent = v;
    });
  });
  document.querySelectorAll("#slotGrid .slot").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#slotGrid .slot").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSlot = btn.textContent.trim();
      document.getElementById("sumTime3").textContent = selectedSlot;
    });
  });
  document.getElementById("pickupDate").addEventListener("change", e => {
    document.getElementById("sumDate3").textContent = fmtDate(e.target.value);
  });
  document.querySelectorAll("#confirmToggle button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#confirmToggle button").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      confirmChannel = btn.dataset.channel;
    });
  });

  function goStep(n) {
    document.querySelectorAll("#orderForm [data-pane]").forEach(p => p.classList.toggle("hidden", p.dataset.pane !== String(n)));
    document.querySelectorAll("#stepper .step-pill").forEach(p => {
      const s = parseInt(p.dataset.step, 10);
      p.classList.toggle("active", s === n);
      p.classList.toggle("done", s < n);
      p.querySelector(".num").textContent = s < n ? "✓" : String(s);
    });
    window.scrollTo({ top: document.getElementById("stepper").offsetTop - 90, behavior: "smooth" });
  }
  document.querySelectorAll("#orderForm [data-next]").forEach(btn => {
    btn.addEventListener("click", () => {
      const n = parseInt(btn.dataset.next, 10);
      if (n === 3) {
        const d = document.getElementById("pickupDate").value;
        if (!d) { alert("Bitte wählen Sie ein Abholdatum."); document.getElementById("pickupDate").focus(); return; }
        document.getElementById("sumDate3").textContent = fmtDate(d);
      }
      goStep(n);
    });
  });

  orderForm.addEventListener("submit", e => {
    e.preventDefault();
    const err = document.getElementById("orderError");
    err.textContent = "";
    const ok = requiredOk(["oName", "oPhone", "oEmail"]);
    const date = document.getElementById("pickupDate").value;
    if (!date) { err.textContent = "Bitte wählen Sie ein Abholdatum (Schritt 2)."; return; }
    if (!document.getElementById("oPrivacy").checked) { err.textContent = "Bitte bestätigen Sie die Datenschutzerklärung."; return; }
    if (!ok) { err.textContent = "Bitte füllen Sie alle Pflichtfelder aus."; return; }
    const code = genCode("LDG");
    document.getElementById("orderCode").textContent = code;
    document.getElementById("confirmTime").textContent = "Heute, " + nowTime() + " Uhr";
    document.getElementById("cCake").textContent = CAKES[selectedCake];
    document.getElementById("cSize").textContent = document.querySelector("#sizeCards input:checked").value;
    document.getElementById("cDate").textContent = fmtDate(date);
    document.getElementById("cTime").textContent = fmtDate(date) + " · " + selectedSlot;
    document.getElementById("cChannel").textContent = confirmChannel;
    const contact = confirmChannel === "WhatsApp"
      ? document.getElementById("oPhone").value.trim()
      : document.getElementById("oEmail").value.trim();
    document.getElementById("cContact").textContent = contact || "—";
    document.querySelectorAll("#orderForm [data-pane]").forEach(p => p.classList.add("hidden"));
    document.getElementById("orderConfirmation").classList.remove("hidden");
    document.querySelectorAll("#stepper .step-pill").forEach(p => {
      p.classList.remove("active"); p.classList.add("done");
      p.querySelector(".num").textContent = "✓";
    });
    document.getElementById("orderConfirmation").scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("orderRestart").addEventListener("click", () => {
    orderForm.reset();
    selectedCake = "milchmaedchen";
    selectedSlot = "14:00 – 16:00 Uhr";
    renderCake();
    document.querySelectorAll("#sizeCards .radio-card").forEach((c, i) => c.classList.toggle("selected", i === 0));
    document.querySelectorAll("#slotGrid .slot").forEach((b, i) => b.classList.toggle("selected", i === 2));
    document.getElementById("sumDate3").textContent = "—";
    document.getElementById("orderConfirmation").classList.add("hidden");
    document.querySelectorAll("#stepper .step-pill").forEach(p => {
      p.classList.remove("done"); p.querySelector(".num").textContent = p.dataset.step;
    });
    goStep(1);
  });
}

/* ---------- chat mock ---------- */
const chatBody = document.getElementById("chatBody");
if (chatBody) {
  const chipsEl = document.getElementById("chatChips");
  const input = document.getElementById("chatInput");
  const FIRST_LINE = "Ich möchte eine Torte für Samstag bestellen";
  const STAGES = {
    start: {
      chips: [{ label: FIRST_LINE, reply: "Sehr gerne! Dariia & Nataliia backen frisch für Sie. Welche Torte darf es sein?" }],
      next: "cake"
    },
    cake: {
      chips: [
        { label: "Milchmädchen mit Himbeeren", reply: "Exzellente Wahl! Für wie viele Personen und zu welcher Uhrzeit am Samstag dürfen wir sie bereitstellen?" },
        { label: "Honigtorte", reply: "Eine wunderbare Wahl — unsere Honigtorte ist ein echtes Familienrezept. Für wie viele Personen und zu welcher Uhrzeit am Samstag dürfen wir sie bereitstellen?" },
        { label: "Schokotorte", reply: "Sehr gute Wahl — dunkle Schokolade, samtige Creme. Für wie viele Personen und zu welcher Uhrzeit am Samstag dürfen wir sie bereitstellen?" }
      ],
      next: "time"
    },
    time: {
      chips: [
        { label: "12 Personen, 14:00 Uhr", reply: "Perfekt! 12 Personen, Samstag um 14:00 Uhr — notiert. Bitte nennen Sie uns noch Ihren Namen, dann bestätigen wir Ihre Vorbestellung. Oder bestellen Sie direkt im Vorbestell-Tool weiter." },
        { label: "8 Personen, 11:00 Uhr", reply: "Perfekt! 8 Personen, Samstag um 11:00 Uhr — notiert. Bitte nennen Sie uns noch Ihren Namen, dann bestätigen wir Ihre Vorbestellung. Oder bestellen Sie direkt im Vorbestell-Tool weiter." }
      ],
      next: "done"
    },
    done: { chips: [], next: "done" }
  };
  let stage = "start";
  const initialBot = chatBody.innerHTML;

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.innerHTML = "";
    div.appendChild(document.createTextNode(text));
    const t = document.createElement("time");
    t.textContent = nowTime() + (who === "user" ? " ✓✓" : "");
    div.appendChild(t);
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function showTyping() {
    const tp = document.createElement("div");
    tp.className = "typing"; tp.id = "typingInd";
    tp.innerHTML = "<i></i><i></i><i></i>";
    chatBody.appendChild(tp);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function hideTyping() { const tp = document.getElementById("typingInd"); if (tp) tp.remove(); }
  function renderChips(list) {
    chipsEl.innerHTML = "";
    list.forEach(c => {
      const b = document.createElement("button");
      b.className = "chip"; b.type = "button";
      b.textContent = c.label;
      b.addEventListener("click", () => handleUser(c.label, c.reply));
      chipsEl.appendChild(b);
    });
  }
  function handleUser(text, botReply) {
    addMsg(text, "user");
    chipsEl.innerHTML = "";
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMsg(botReply, "bot");
      const nextStage = STAGES[stage].next;
      stage = nextStage;
      renderChips(STAGES[stage].chips);
    }, 1100);
  }
  function resetChat() {
    chatBody.innerHTML = initialBot;
    stage = "start";
    renderChips(STAGES.start.chips);
  }
  renderChips(STAGES.start.chips);
  document.getElementById("chatSend").addEventListener("click", () => {
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    const chips = STAGES[stage].chips;
    const match = chips.find(c => c.label.toLowerCase() === v.toLowerCase());
    if (match) handleUser(match.label, match.reply);
    else handleUser(v, "Gerne! Schreiben Sie uns kurz, welche Torte und für wann — oder tippen Sie auf eine der Vorschläge unten.");
  });
  input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); document.getElementById("chatSend").click(); } });
  const replay = document.getElementById("chatReplay");
  if (replay) replay.addEventListener("click", resetChat);
}

/* ---------- steppers (persons / guests) ---------- */
document.querySelectorAll("[data-stepper]").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.stepper;
    const hidden = document.getElementById(id);
    const label = document.getElementById(id + "Val");
    let v = parseInt(hidden.value, 10) + parseInt(btn.dataset.dir, 10);
    const max = id === "eGuests" ? 30 : 10;
    v = Math.max(1, Math.min(max, v));
    hidden.value = v; label.textContent = v;
  });
});

/* ---------- visit-type cards ---------- */
document.querySelectorAll(".visit-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".visit-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    card.querySelector("input").checked = true;
  });
});

/* ---------- table reservation ---------- */
const tableForm = document.getElementById("tableForm");
if (tableForm) {
  tableForm.addEventListener("submit", e => {
    e.preventDefault();
    const err = document.getElementById("tableError");
    err.textContent = "";
    if (!document.getElementById("tDate").value) { err.textContent = "Bitte wählen Sie ein Datum."; return; }
    if (!requiredOk(["tName", "tPhone", "tEmail"])) { err.textContent = "Bitte füllen Sie alle Pflichtfelder aus."; return; }
    const name = document.getElementById("tName").value.trim();
    const email = document.getElementById("tEmail").value.trim();
    const visit = document.querySelector('input[name="visit"]:checked').value;
    document.getElementById("resCode").textContent = genCode("RES");
    document.getElementById("resSummary").innerHTML =
      "Vielen Dank, <b>" + escapeHtml(name) + "</b>! Wir haben Ihre Reservierung (" + escapeHtml(visit) +
      ") für <b>" + document.getElementById("tPersons").value + " Personen</b> am <b>" +
      fmtDate(document.getElementById("tDate").value) + "</b> um <b>" +
      escapeHtml(document.getElementById("tTime").value) + "</b> eingetragen. Eine automatische Bestätigung wurde an <b>" +
      escapeHtml(email) + "</b> versendet. (Demo)";
    document.getElementById("tableFormCard").classList.add("hidden");
    document.getElementById("tableConfirmation").classList.remove("hidden");
  });
  document.getElementById("tableRestart").addEventListener("click", () => {
    tableForm.reset();
    document.getElementById("tPersons").value = "4";
    document.getElementById("tPersonsVal").textContent = "4";
    document.getElementById("tableConfirmation").classList.add("hidden");
    document.getElementById("tableFormCard").classList.remove("hidden");
  });
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- event enquiry ---------- */
const eventForm = document.getElementById("eventForm");
if (eventForm) {
  document.querySelectorAll("#occasionCards .radio-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll("#occasionCards .radio-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      card.querySelector("input").checked = true;
    });
  });
  eventForm.addEventListener("submit", e => {
    e.preventDefault();
    const err = document.getElementById("eventError");
    err.textContent = "";
    if (!document.getElementById("eDate").value) { err.textContent = "Bitte wählen Sie ein Datum."; return; }
    if (!requiredOk(["eName", "ePhone", "eEmail"])) { err.textContent = "Bitte füllen Sie alle Pflichtfelder aus."; return; }
    const name = document.getElementById("eName").value.trim();
    document.getElementById("evMailTo").textContent = document.getElementById("eEmail").value.trim();
    document.getElementById("evName").textContent = name;
    document.getElementById("evOccasion").textContent = document.querySelector('input[name="occasion"]:checked').value;
    document.getElementById("evGuests").textContent = document.getElementById("eGuests").value;
    document.getElementById("evDate").textContent = fmtDate(document.getElementById("eDate").value);
    document.getElementById("evTime").textContent = document.getElementById("eTime").value;
    const catering = Array.from(document.querySelectorAll('input[name="catering"]:checked')).map(c => c.value);
    document.getElementById("evCatering").textContent = catering.length ? catering.join(", ") : "—";
    document.getElementById("eventFormCard").classList.add("hidden");
    document.getElementById("eventConfirmation").classList.remove("hidden");
  });
  document.getElementById("eventRestart").addEventListener("click", () => {
    eventForm.reset();
    document.getElementById("eGuests").value = "20";
    document.getElementById("eGuestsVal").textContent = "20";
    document.getElementById("eventConfirmation").classList.add("hidden");
    document.getElementById("eventFormCard").classList.remove("hidden");
  });
}

/* ---------- contact form ---------- */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    const err = document.getElementById("contactError");
    err.textContent = "";
    if (!requiredOk(["kName", "kEmail", "kMsg"])) { err.textContent = "Bitte füllen Sie alle Pflichtfelder aus."; return; }
    document.getElementById("kConfirmName").textContent = document.getElementById("kName").value.trim();
    document.getElementById("kConfirmTopic").textContent = document.getElementById("kTopic").value;
    document.getElementById("contactFormCard").classList.add("hidden");
    document.getElementById("contactConfirmation").classList.remove("hidden");
  });
  document.getElementById("contactRestart").addEventListener("click", () => {
    contactForm.reset();
    document.getElementById("contactConfirmation").classList.add("hidden");
    document.getElementById("contactFormCard").classList.remove("hidden");
  });
}
