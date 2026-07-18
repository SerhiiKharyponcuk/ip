const $ = (selector) => document.querySelector(selector);

const hero = $("#hero");
const scanner = $("#scanner");
const results = $("#results");
const terminal = $("#terminal");
const progressBar = $("#progressBar");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function updateClock() {
  $("#clock").textContent = new Intl.DateTimeFormat("ru-RU", {
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
  $("#connection").textContent = data?.type ? `${data.type.toUpperCase()} СОЕДИНЕНИЕ` : "данные скрыты или заблокированы";
  $("#city").textContent = data?.city || "неизвестно";
  $("#region").textContent = data?.region || "по IP-адресу";
  $("#country").textContent = data?.country || "неизвестно";
  $("#timezone").textContent = data?.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone;
  $("#isp").textContent = data?.connection?.isp || "неизвестно";
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
    ["Инициализация защищённого терминала...", "muted", 350, 12],
    ["Проверка сетевого интерфейса", "ok", 500, 26],
    ["Поиск публичного IP-адреса...", "", 600, 43],
    ["Анализ маршрута и провайдера", "ok", 500, 61],
    ["Определение региона подключения...", "", 650, 79],
    ["Формирование цифрового отпечатка", "ok", 450, 94],
    ["Сканирование завершено", "warn", 350, 100],
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
  title.textContent = "ДОСТУП К КАМЕРЕ ПОЛУЧЕН...";
  text.textContent = "Подготовка снимка через 3 секунды.";
  await wait(700);
  prank.classList.add("show");

  for (let number = 3; number > 0; number -= 1) {
    text.textContent = `Подготовка снимка через ${number} секунды.`;
    await wait(850);
  }

  prank.classList.add("safe");
  title.textContent = "ШУТКА! КАМЕРА НЕ ВКЛЮЧАЛАСЬ 😄";
  text.textContent = "Сайт не запрашивает доступ к камере и ничего не записывает.";
}

function requestLocation() {
  const button = $("#locationButton");
  const geoText = $("#geoText");

  if (!navigator.geolocation) {
    geoText.textContent = "Этот браузер не поддерживает геолокацию.";
    button.disabled = true;
    return;
  }

  button.disabled = true;
  button.textContent = "ОЖИДАНИЕ РАЗРЕШЕНИЯ...";
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const lat = coords.latitude.toFixed(6);
      const lon = coords.longitude.toFixed(6);
      $("#latitude").textContent = lat;
      $("#longitude").textContent = lon;
      $("#accuracy").textContent = Math.round(coords.accuracy);
      $("#mapLink").href = `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lon}`)}`;
      $("#coordinates").classList.remove("hidden");
      geoText.textContent = "Координаты получены локально. После закрытия страницы они исчезнут.";
      button.classList.add("hidden");
    },
    (error) => {
      const messages = {
        1: "Доступ отклонён. Без разрешения определить точное местоположение невозможно.",
        2: "Не удалось определить местоположение.",
        3: "Время ожидания истекло. Попробуй ещё раз.",
      };
      geoText.textContent = messages[error.code] || "Произошла ошибка геолокации.";
      button.disabled = false;
      button.textContent = "ПОПРОБОВАТЬ ЕЩЁ РАЗ";
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
  );
}

$("#startButton").addEventListener("click", startScan);
$("#locationButton").addEventListener("click", requestLocation);
$("#resetButton").addEventListener("click", () => {
  results.classList.add("hidden");
  $("#prank").classList.remove("show", "safe");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(startScan, 250);
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
