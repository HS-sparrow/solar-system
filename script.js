// 八大行星的顯示資料：軌道半徑、大小、顏色與公轉週期皆為示意值
const planets = [
  { id: "mercury", name: "水星", english: "MERCURY", color: "#b9b1a5", radius: 11, size: 0.55, period: 9, distance: "約 5,790 萬公里", year: "88 個地球日", kind: "類地行星", summary: "最靠近太陽的行星，白天炎熱、夜晚寒冷，表面布滿撞擊坑。" },
  { id: "venus", name: "金星", english: "VENUS", color: "#e7b66b", radius: 16, size: 0.82, period: 15, distance: "約 1 億 820 萬公里", year: "225 個地球日", kind: "類地行星", summary: "濃厚的大氣造成強烈溫室效應，是太陽系最熱的行星。" },
  { id: "earth", name: "地球", english: "EARTH", color: "#4da9e8", radius: 21, size: 0.9, period: 22, distance: "約 1 億 5,000 萬公里", year: "365 個地球日", kind: "類地行星", summary: "我們的家園，擁有液態海洋、豐富生命與一顆天然衛星。" },
  { id: "mars", name: "火星", english: "MARS", color: "#d86f50", radius: 26, size: 0.68, period: 29, distance: "約 2 億 2,790 萬公里", year: "687 個地球日", kind: "類地行星", summary: "因表面的氧化鐵而呈現紅色，是人類探索的重要目標。" },
  { id: "jupiter", name: "木星", english: "JUPITER", color: "#d9ad83", radius: 32, size: 1.65, period: 39, distance: "約 7 億 7,830 萬公里", year: "約 11.9 個地球年", kind: "氣體巨行星", summary: "太陽系最大的行星，大紅斑是一場持續數百年的巨大風暴。" },
  { id: "saturn", name: "土星", english: "SATURN", color: "#e4ce91", radius: 37, size: 1.4, period: 49, distance: "約 14 億 3,000 萬公里", year: "約 29.5 個地球年", kind: "氣體巨行星", summary: "壯觀的冰塵環系環繞著土星，是太陽系最醒目的景觀之一。" },
  { id: "uranus", name: "天王星", english: "URANUS", color: "#83d5d2", radius: 42, size: 1.15, period: 60, distance: "約 28 億 7,000 萬公里", year: "約 84 個地球年", kind: "冰巨行星", summary: "帶有淡藍綠色的大氣，旋轉軸幾乎側躺在公轉軌道上。" },
  { id: "neptune", name: "海王星", english: "NEPTUNE", color: "#557ce6", radius: 47, size: 1.12, period: 72, distance: "約 45 億公里", year: "約 165 個地球年", kind: "冰巨行星", summary: "目前已知最遠的行星，深藍色大氣中有著太陽系最快的強風。" },
];

const orbitContainer = document.querySelector("#orbits");
const planetList = document.querySelector("#planet-list");
const speedSlider = document.querySelector("#speed-slider");
const speedValue = document.querySelector("#speed-value");
const toggleButton = document.querySelector("#toggle-button");
const toggleIcon = document.querySelector("#toggle-icon");
const toggleText = document.querySelector("#toggle-text");
const resetButton = document.querySelector("#reset-button");
const planetEmblem = document.querySelector("#planet-emblem");
const planetKicker = document.querySelector("#planet-kicker");
const planetName = document.querySelector("#planet-name");
const planetSummary = document.querySelector("#planet-summary");
const planetFacts = document.querySelector("#planet-facts");
const sunButton = document.querySelector(".sun");

const orbitViews = [];
let selectedId = null;
let manuallyPaused = false;

// 建立行星軌道、可點選的行星，以及右側的快速選擇清單
planets.forEach((planet, index) => {
  const orbit = document.createElement("div");
  orbit.className = "orbit";
  orbit.style.setProperty("--orbit-diameter", `${planet.radius * 2}%`);
  orbit.style.setProperty("--orbit-duration", `${planet.period}s`);
  orbit.style.setProperty("--planet-color", planet.color);
  orbit.setAttribute("aria-label", `${planet.name}的公轉軌道`);

  const marker = document.createElement("div");
  marker.className = "planet-marker";
  marker.style.setProperty("--orbit-duration", `${planet.period}s`);

  const button = document.createElement("button");
  button.className = "planet-button";
  button.type = "button";
  button.style.setProperty("--planet-color", planet.color);
  button.style.setProperty("--planet-size", `clamp(7px, ${planet.size}vw, ${Math.round(planet.size * 14)}px)`);
  button.setAttribute("aria-label", `選取${planet.name}`);
  button.title = `${planet.name} ${planet.english}`;
  button.addEventListener("click", () => selectPlanet(planet.id));

  const label = document.createElement("span");
  label.className = "planet-label";
  label.textContent = planet.name;
  marker.append(button, label);
  orbit.append(marker);
  orbitContainer.append(orbit);
  orbitViews.push({ orbit, marker, button, planet });

  const listButton = document.createElement("button");
  listButton.type = "button";
  listButton.className = "planet-list-button";
  listButton.dataset.planetId = planet.id;
  listButton.innerHTML = `<span class="list-swatch" style="background:${planet.color}"></span><span>${planet.name}</span><small>${index + 1} / 8</small>`;
  listButton.addEventListener("click", () => selectPlanet(planet.id));
  planetList.append(listButton);
});

// 更新右側資訊卡和兩處選取狀態
function selectPlanet(id) {
  const planet = planets.find((item) => item.id === id);
  if (!planet) return;

  selectedId = id;
  planetEmblem.textContent = "✦";
  planetEmblem.style.color = planet.color;
  planetKicker.textContent = planet.english;
  planetName.textContent = planet.name;
  planetSummary.textContent = planet.summary;
  planetFacts.innerHTML = `
    <div class="fact-row"><span>行星類型</span><strong>${planet.kind}</strong></div>
    <div class="fact-row"><span>距離太陽</span><strong>${planet.distance}</strong></div>
    <div class="fact-row"><span>公轉週期</span><strong>${planet.year}</strong></div>`;
  document.querySelectorAll(".planet-button").forEach((button, index) => {
    button.classList.toggle("selected", planets[index].id === id);
    button.setAttribute("aria-pressed", planets[index].id === id ? "true" : "false");
  });
  document.querySelectorAll(".planet-list-button").forEach((button) => {
    const active = button.dataset.planetId === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

// 太陽也可以點選，顯示太陽的簡介
sunButton.addEventListener("click", () => {
  selectedId = null;
  planetEmblem.textContent = "☼";
  planetEmblem.style.color = "#ffc66d";
  planetKicker.textContent = "THE SUN";
  planetName.textContent = "太陽";
  planetSummary.textContent = "太陽系的中心恆星，以光和熱維繫著周圍的行星。";
  planetFacts.innerHTML = `
    <div class="fact-row"><span>天體類型</span><strong>G 型主序星</strong></div>
    <div class="fact-row"><span>太陽系天體數</span><strong>8 顆行星</strong></div>
    <div class="fact-row"><span>光抵達地球</span><strong>約 8 分 20 秒</strong></div>`;
  document.querySelectorAll(".planet-button, .planet-list-button").forEach((button) => {
    button.classList.remove("selected", "active");
    button.setAttribute("aria-pressed", "false");
  });
});

// 依據暫停狀態與速度滑桿更新所有軌道動畫
function updateMotion() {
  const speed = Number(speedSlider.value);
  const stopped = manuallyPaused || speed === 0;
  orbitViews.forEach(({ orbit, marker, planet }) => {
    orbit.classList.toggle("paused", stopped);
    const duration = speed === 0 ? planet.period : planet.period / speed;
    orbit.style.animationDuration = `${duration}s`;
    marker.style.animationDuration = `${duration}s`;
  });
  speedValue.value = speed === 0 ? "暫停" : `${speed.toFixed(1)}×`;
  toggleButton.setAttribute("aria-pressed", stopped ? "true" : "false");
  toggleIcon.textContent = stopped ? "▶" : "Ⅱ";
  toggleText.textContent = stopped ? "繼續公轉" : "暫停公轉";
}

toggleButton.addEventListener("click", () => {
  manuallyPaused = !manuallyPaused;
  updateMotion();
});
speedSlider.addEventListener("input", updateMotion);

// 重設速度、播放狀態、軌道起點和目前選取的天體
resetButton.addEventListener("click", () => {
  manuallyPaused = false;
  speedSlider.value = "1";
  orbitViews.forEach(({ orbit }) => {
    orbit.style.animation = "none";
    void orbit.offsetWidth;
    orbit.style.animation = "";
  });
  updateMotion();
  selectedId = null;
  planetEmblem.textContent = "☉";
  planetEmblem.style.color = "";
  planetKicker.textContent = "SOLAR SYSTEM";
  planetName.textContent = "太陽系探索";
  planetSummary.textContent = "選擇一顆行星，認識它的特色與在太陽系中的位置。";
  planetFacts.innerHTML = `
    <div class="fact-row"><span>行星數量</span><strong>8 顆</strong></div>
    <div class="fact-row"><span>所在星系</span><strong>銀河系</strong></div>`;
  document.querySelectorAll(".planet-button, .planet-list-button").forEach((button) => {
    button.classList.remove("selected", "active");
    button.setAttribute("aria-pressed", "false");
  });
});

// 初始速度設為一倍
updateMotion();

// 在既有太陽系場景後方繪製可縮放的動態星空，不影響軌道與控制功能。
const starCanvas = document.createElement("canvas");
starCanvas.id = "starfield";
starCanvas.setAttribute("aria-hidden", "true");
document.body.prepend(starCanvas);
const starContext = starCanvas.getContext("2d");
let stars = [];
let starWidth = 0;
let starHeight = 0;
function resizeStarfield() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  starWidth = window.innerWidth;
  starHeight = window.innerHeight;
  starCanvas.width = Math.round(starWidth * dpr);
  starCanvas.height = Math.round(starHeight * dpr);
  starCanvas.style.width = `${starWidth}px`;
  starCanvas.style.height = `${starHeight}px`;
  starContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(180, Math.max(65, Math.round(starWidth * starHeight / 8500)));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * starWidth,
    y: Math.random() * starHeight,
    radius: Math.random() * 1.35 + .25,
    speed: Math.random() * 8 + 2,
    phase: Math.random() * Math.PI * 2,
    twinkle: Math.random() * 1.4 + .5,
  }));
}
let lastStarFrame = 0;
function animateStarfield(now) {
  const delta = Math.min((now - lastStarFrame) / 1000 || 0, .05);
  lastStarFrame = now;
  starContext.clearRect(0, 0, starWidth, starHeight);
  for (const star of stars) {
    star.y += star.speed * delta;
    if (star.y > starHeight + 2) { star.y = -2; star.x = Math.random() * starWidth; }
    const alpha = .32 + (Math.sin(now / 1000 * star.twinkle + star.phase) + 1) * .32;
    starContext.beginPath();
    starContext.fillStyle = `rgba(205,220,255,${alpha})`;
    starContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    starContext.fill();
  }
  requestAnimationFrame(animateStarfield);
}
resizeStarfield();
window.addEventListener("resize", resizeStarfield, { passive: true });
requestAnimationFrame(animateStarfield);

// 提供自訂滑入提示，同時保留原有 title 與鍵盤操作。
planets.forEach((planet) => {
  const button = orbitViews.find((view) => view.planet.id === planet.id)?.button;
  if (button) {
    button.dataset.planet = planet.id;
    button.dataset.tooltip = `${planet.name} · ${planet.english}`;
  }
});
