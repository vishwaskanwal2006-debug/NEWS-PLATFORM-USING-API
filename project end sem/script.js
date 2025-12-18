const apiKey = "cvv5k71r01qi0bq33iu0cvv5k71r01qi0bq33iug";
const stockSymbols = ["AAPL", "GOOGL", "AMZN", "MSFT", "TSLA", "META", "NFLX", "NVDA", "INTC", "BABA", "V", "JPM", "DIS", "PYPL", "ADBE"];
const cryptoPairs = ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:SOLUSDT"];

const stocksContainer = document.getElementById("stocksContainer");
const cryptoContainer = document.getElementById("cryptoContainer");
const searchInput = document.getElementById("search");

let stockData = [];
let cryptoData = [];

function createCard(symbol, price, change) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>${symbol}</h3>
    <p>$${price.toFixed(2)}</p>
    <span style="color:${change >= 0 ? 'green' : 'red'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>
  `;
  return card;
}

async function fetchStockData() {
  const data = await Promise.all(
    stockSymbols.map(async (symbol) => {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
      const json = await res.json();
      return {
        symbol,
        price: json.c,
        change: ((json.c - json.pc) / json.pc) * 100
      };
    })
  );
  return data;
}

async function fetchCryptoData() {
  const data = await Promise.all(
    cryptoPairs.map(async (symbol) => {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
      const json = await res.json();
      return {
        symbol: symbol.split(":")[1],
        price: json.c,
        change: ((json.c - json.pc) / json.pc) * 100
      };
    })
  );
  return data;
}

function render(container, items) {
  const query = searchInput.value.toLowerCase();
  container.innerHTML = "";
  items
    .filter(i => i.symbol.toLowerCase().includes(query))
    .forEach(i => container.appendChild(createCard(i.symbol, i.price, i.change)));
}

async function loadData() {
  [stockData, cryptoData] = await Promise.all([fetchStockData(), fetchCryptoData()]);
  render(stocksContainer, stockData);
  render(cryptoContainer, cryptoData);
}

// Sorting logic
function sortAndRender(type) {
  let sortedStocks = [...stockData];
  let sortedCryptos = [...cryptoData];

  if (type === 'gainers') {
    sortedStocks.sort((a, b) => b.change - a.change);
    sortedCryptos.sort((a, b) => b.change - a.change);
  } else if (type === 'losers') {
    sortedStocks.sort((a, b) => a.change - b.change);
    sortedCryptos.sort((a, b) => a.change - b.change);
  }

  render(stocksContainer, sortedStocks);
  render(cryptoContainer, sortedCryptos);
}

document.getElementById("refreshBtn").addEventListener("click", loadData);
document.getElementById("gainersBtn").addEventListener("click", () => sortAndRender('gainers'));
document.getElementById("losersBtn").addEventListener("click", () => sortAndRender('losers'));
document.getElementById("allBtn").addEventListener("click", () => {
  render(stocksContainer, stockData);
  render(cryptoContainer, cryptoData);
});

searchInput.addEventListener("input", () => {
  render(stocksContainer, stockData);
  render(cryptoContainer, cryptoData);
});

// Dark/Light mode toggle
const darkToggle = document.getElementById("darkToggle");
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});

// Auto-refresh every 60s
setInterval(loadData, 60000);
loadData();
