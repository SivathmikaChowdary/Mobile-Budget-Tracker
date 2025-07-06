let income = +localStorage.getItem("income") || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;

const $ = (id) => document.getElementById(id);
const ctx = $("budgetChart").getContext("2d");

const show = (el, on = true) => (el.style.display = on ? "block" : "none");

const hashColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return "#" + ((hash >> 24) & 0xFF).toString(16).padStart(2, '0') +
               ((hash >> 16) & 0xFF).toString(16).padStart(2, '0') +
               ((hash >> 8) & 0xFF).toString(16).padStart(2, '0');
};

const render = () => {
  $("expenseList").innerHTML = "";
  let total = 0;
  expenses.forEach((e, i) => {
    total += e.amount;
    $("expenseList").innerHTML += `<li>${e.name} - ₹${e.amount} <button class="delete-btn" onclick="del(${i})">🗑️</button></li>`;
  });
  $("remaining").textContent = income - total;
  $("totalIncome").textContent = income;
};

const chartData = () => {
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: expenses.map((e) => e.name),
      datasets: [{
        data: expenses.map((e) => e.amount),
        backgroundColor: expenses.map((e) => hashColor(e.name)),
      }],
    },
  });
};

const save = () => localStorage.setItem("expenses", JSON.stringify(expenses));

$("loginForm").onsubmit = (e) => {
  e.preventDefault();
  const name = $("name").value;
  localStorage.setItem("user", JSON.stringify({ name }));
  afterLogin(name);
};

function afterLogin(name) {
  show($("loginSection"), false);
  show($("trackerSection"));
  $("userName").textContent = name;
  $("body").style.background = "linear-gradient(120deg, #1e2a38, #3e5871)";
  if (income) {
    show($("incomeSection"), false);
    show($("expenseSection"));
    render();
    chartData();
  }
}

function setIncome() {
  income = +$("incomeInput").value;
  if (income > 0) {
    localStorage.setItem("income", income);
    show($("incomeSection"), false);
    show($("expenseSection"));
    render();
    chartData();
  } else alert("Enter valid income");
}

$("expenseForm").onsubmit = (e) => {
  e.preventDefault();
  const name = $("expenseName").value.trim();
  const amount = +$("expenseAmount").value;
  if (!name || amount <= 0) return alert("Enter valid data");
  expenses.push({ name, amount });
  save();
  render();
  chartData();
  e.target.reset();
};

function del(i) {
  expenses.splice(i, 1);
  save();
  render();
  chartData();
}

function exportCSV() {
  const rows = [["Expense Name", "Amount"], ...expenses.map(e => [e.name, e.amount])];
  const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
}

function logout() {
  localStorage.clear();
  location.reload();
}

window.onload = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) afterLogin(user.name);
  if (income) {
    $("totalIncome").textContent = income;
    show($("incomeSection"), false);
    show($("expenseSection"));
    render();
    chartData();
  }
};
