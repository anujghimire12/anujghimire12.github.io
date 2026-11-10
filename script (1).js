// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Live Nepal clock and date ----------
const TZ = "Asia/Kathmandu";
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
function tick() {
  const now = new Date();
  clockEl.textContent = timeFmt.format(now);
  dateEl.textContent = dateFmt.format(now);
}
tick();
setInterval(tick, 1000);

// ---------- Weather (Open-Meteo, no key needed) ----------
// Dharan. To change the city, change these two numbers and the label in index.html.
const LAT = 26.8065, LON = 87.2846;
const tempEl = document.getElementById("temp");
const wxEl = document.getElementById("wx");
function describe(code) {
  if (code === 0) return "\u2600\uFE0F Clear sky";
  if (code <= 2) return "\uD83C\uDF24\uFE0F Partly cloudy";
  if (code === 3) return "\u2601\uFE0F Overcast";
  if (code === 45 || code === 48) return "\uD83C\uDF2B\uFE0F Foggy";
  if (code >= 51 && code <= 57) return "\uD83C\uDF26\uFE0F Drizzle";
  if (code >= 61 && code <= 67) return "\uD83C\uDF27\uFE0F Rain";
  if (code >= 71 && code <= 77) return "\u2744\uFE0F Snow";
  if (code >= 80 && code <= 82) return "\uD83C\uDF26\uFE0F Showers";
  if (code >= 95) return "\u26C8\uFE0F Thunderstorm";
  return "\uD83C\uDF21\uFE0F Weather";
}
async function loadWeather() {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + LAT + "&longitude=" + LON + "&current=temperature_2m,weather_code";
    const res = await fetch(url);
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    tempEl.textContent = Math.round(data.current.temperature_2m) + "\u00B0C";
    wxEl.textContent = describe(data.current.weather_code);
  } catch (e) {
    tempEl.textContent = "--\u00B0C";
    wxEl.textContent = "Weather unavailable";
  }
}
loadWeather();
setInterval(loadWeather, 15 * 60 * 1000);

// ---------- Battery (shows the visitor's own device, only where supported) ----------
if (navigator.getBattery) {
  navigator.getBattery().then((b) => {
    const card = document.getElementById("battery-card");
    const txt = document.getElementById("batt");
    const bar = document.getElementById("battbar");
    function show() {
      const pct = Math.round(b.level * 100);
      txt.textContent = pct + "%" + (b.charging ? " \u26A1" : "");
      bar.style.width = pct + "%";
    }
    card.hidden = false;
    show();
    b.addEventListener("levelchange", show);
    b.addEventListener("chargingchange", show);
  }).catch(() => {});
}

// ---------- Dark / light mode ----------
const themeBtn = document.getElementById("theme");
function paintThemeBtn() {
  const light = document.documentElement.dataset.theme === "light";
  themeBtn.innerHTML = light ? "&#9728;" : "&#9790;";
}
paintThemeBtn();
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
  paintThemeBtn();
});

// ---------- Back to top ----------
const toTop = document.getElementById("totop");
window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 500), { passive: true });

// ---------- Reveal on scroll ----------
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

// ---------- Highlight current section in the bottom menu ----------
const links = document.querySelectorAll(".dock a");
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-40% 0px -50% 0px" });
links.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s) spy.observe(s); });
