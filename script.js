const $ = (selector) => document.querySelector(selector);

const hero = $("#hero");
const scanner = $("#scanner");
const results = $("#results");
const terminal = $("#terminal");
const progressBar = $("#progressBar");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function updateClock() {
  $("#clock").textContent = new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 1000);

function terminalLine(text, className = "") {
  const line = document.createElement("p");
  line.className = className;
  line.textContent = `> ${text}`;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

async function getNetworkData() {
  try {
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) throw new Error("network response failed");
    const data = await response.json();
    if (!data.success) throw new Error(data.message || "lookup failed");
    return data;
  } catch {
    return null;
  }
}

function fillResults(data) {
  $("#ip").textContent = data?.ip || "недоступно";
  $("#connection").textContent = data?.type ? `${data.type.toUpperCase()} CONNECTION` : "дані приховані або заблоковані";
  $("#city").textContent = data?.city || "невідомо";
  $("#region").textContent = data?.region || "за IP-адресою";
  $("#country").textContent = data?.country || "невідомо";
  $("#timezone").textContent = data?.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone;
  $("#isp").textContent = data?.connection?.isp || "невідомо";
  $("#platform").textContent = `${navigator.platform || "DEVICE"} // ${navigator.language}`;
}

async function startScan() {
  hero.classList.add("hidden");
  results.classList.add("hidden");
  scanner.classList.remove("hidden");
  terminal.textContent = "";
  progressBar.style.width = "4%";

  const dataPromise = getNetworkData();
  const steps = [
    ["Ініціалізація захищеного термінала...", "muted", 350, 12],
    ["Перевірка мережевого інтерфейсу", "ok", 500, 26],
    ["Пошук публічної IP-адреси...", "", 600, 43],
    ["Аналіз маршруту та провайдера", "ok", 500, 61],
    ["Зіставлення регіону підключення...", "", 650, 79],
    ["Формування цифрового відбитка", "ok", 450, 94],
    ["Сканування завершено", "warn", 350, 100],
  ];

  for (const [text, className, delay, progress] of steps) {
    terminalLine(text, className);
    progressBar.style.width = `${progress}%`;
    await wait(delay);
  }

  fillResults(await dataPromise);
  scanner.classList.add("hidden");
  results.classList.remove("hidden");
  results.scrollIntoView({ behavior: "smooth", block: "start" });
  runPrank();
}

async function runPrank() {
  const prank = $("#prank");
  const title = $("#prankTitle");
  const text = $("#prankText");
  prank.classList.remove("safe");
  title.textContent = "ДОСТУП ДО КАМЕРИ ОТРИМАНО...";
  text.textContent = "Підготовка знімка через 3 секунди.";
  await wait(700);
  prank.classList.add("show");

  for (let number = 3; number > 0; number -= 1) {
    text.textContent = `Підготовка знімка через ${number} секунди.`;
    await wait(850);
  }

  prank.classList.add("safe");
  title.textContent = "ЖАРТ! КАМЕРА НЕ ВМИКАЛАСЯ 😄";
  text.textContent = "Сайт не запитує доступ до камери й нічого не записує.";
}

function requestLocation() {
  const button = $("#locationButton");
  const geoText = $("#geoText");

  if (!navigator.geolocation) {
    geoText.textContent = "Цей браузер не підтримує геолокацію.";
    button.disabled = true;
    return;
  }

  button.disabled = true;
  button.textContent = "ОЧІКУВАННЯ ДОЗВОЛУ...";
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const lat = coords.latitude.toFixed(6);
      const lon = coords.longitude.toFixed(6);
      $("#latitude").textContent = lat;
      $("#longitude").textContent = lon;
      $("#accuracy").textContent = Math.round(coords.accuracy);
      $("#mapLink").href = `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lon}`)}`;
      $("#coordinates").classList.remove("hidden");
      geoText.textContent = "Координати отримано локально. Після закриття сторінки вони зникнуть.";
      button.classList.add("hidden");
    },
    (error) => {
      const messages = {
        1: "Доступ відхилено. Це нормально — без дозволу точну адресу визначити неможливо.",
        2: "Не вдалося визначити місцеположення.",
        3: "Час очікування минув. Спробуй ще раз.",
      };
      geoText.textContent = messages[error.code] || "Сталася помилка геолокації.";
      button.disabled = false;
      button.textContent = "СПРОБУВАТИ ЩЕ РАЗ";
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
  );
}

$("#startButton").addEventListener("click", startScan);
$("#locationButton").addEventListener("click", requestLocation);
$("#resetButton").addEventListener("click", () => {
  results.classList.add("hidden");
  $("#prank").classList.remove("show", "safe");
  hero.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Lightweight Matrix-style background.
const canvas = $("#matrix");
const context = canvas.getContext("2d");
let columns = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  columns = Array(Math.ceil(window.innerWidth / 20)).fill(0).map(() => Math.random() * -50);
}

function drawMatrix() {
  context.fillStyle = "rgba(2, 6, 4, 0.09)";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  context.fillStyle = "#35e968";
  context.font = "13px monospace";
  columns.forEach((position, index) => {
    const glyph = String.fromCharCode(0x30a0 + Math.random() * 96);
    context.fillText(glyph, index * 20, position * 20);
    columns[index] = position * 20 > window.innerHeight && Math.random() > 0.975 ? 0 : position + 1;
  });
  requestAnimationFrame(drawMatrix);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
drawMatrix();
