// User accounts
const user1 = {
  login: "aa",
  password: "1234",
  cardNumber: "98600000006769",
  expireDate: "08/28",
  transfers: [
    {
      amount: 2000,
      date: "2025-02-25T12:34:56.789Z",
      name: "Javoxir Alijonov",
    },
  ],
  owner: {
    firstName: "Aziza",
    lastName: "Alijonova",
  },
  currency: "USD",
  locale: "en-EN",
};

const user2 = {
  login: "aj",
  password: "4321",
  cardNumber: "98600000001699",
  expireDate: "12/28",
  transfers: [
    {
      amount: 40000,
      date: "2025-02-25T12:34:56.789Z",
      name: "Aziza Alijonova",
    },
  ],
  owner: {
    firstName: "Javoxir",
    lastName: "Alijonov",
  },
  currency: "UZS",
  locale: "ru-RU",
};

const users = [user1, user2];

// UI Elements
const inputLogin = document.querySelector(".input-login");
const inputPassword = document.querySelector(".input-password");
const btnLogin = document.querySelector(".btn-login");
const brand = document.querySelector(".brand");
const loginForm = document.querySelector(".form-login");
const btnExit = document.querySelector(".btn-exit");
const main = document.querySelector("main");

const watchDiv = document.querySelector(".watch");
const hour = document.querySelector(".hour");
const minute = document.querySelector(".minute");
const second = document.querySelector(".second");

const cardBalance = document.querySelector(".card-balance");
const cardNumber = document.querySelector(".card-number");
const cardOwner = document.querySelector(".card-owner");
const cardDate = document.querySelector(".card-date");
const inComes = document.querySelector(".incomes");
const expenses = document.querySelector(".expenses");
const plastHistory = document.querySelector(".transfers-list");
const transferTo = document.querySelector(".input-transfer-to");
const transferAmount = document.querySelector(".input-transfer-amount");
const btnSend = document.querySelector(".btn-send");

let loggedIn = null;

const calculateBalance = (transfers) =>
  transfers.reduce((sum, el) => sum + el.amount, 0);

const formatCurrency = (amount, locale, currency) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);

const historyTransfers = (transfers, locale, currency) => {
  const income = transfers
    .filter((el) => el.amount > 0)
    .reduce((sum, el) => sum + el.amount, 0);
  const expense = transfers
    .filter((el) => el.amount < 0)
    .reduce((sum, el) => sum + el.amount, 0);
  return {
    income: formatCurrency(income, locale, currency),
    expense: formatCurrency(expense, locale, currency),
  };
};

const historyData = (transfers) =>
  transfers
    .map(
      (el) => `
    <li class="transfer-item">
      <div class="transfer-type">
        <p class="person">${el.name}</p>
        <span class="time"> ${new Date(el.date).toLocaleString(
          loggedIn.locale
        )} </span>
      </div>
      <span class="transfer-amount ${el.amount > 0 ? "green" : "red"}">
        ${formatCurrency(el.amount, loggedIn.locale, loggedIn.currency)}
      </span>
    </li>
  `
    )
    .join("");

const updateSummary = () => {
  if (!loggedIn) return;
  cardBalance.textContent = formatCurrency(
    calculateBalance(loggedIn.transfers),
    loggedIn.locale,
    loggedIn.currency
  );
  const { income, expense } = historyTransfers(
    loggedIn.transfers,
    loggedIn.locale,
    loggedIn.currency
  );
  inComes.textContent = income;
  expenses.textContent = expense;
  plastHistory.innerHTML = historyData(loggedIn.transfers);
};

btnLogin.addEventListener("click", (event) => {
  event.preventDefault();
  const currentAccount = users.find(
    (acc) =>
      acc.login === inputLogin.value && acc.password === inputPassword.value
  );
  if (!currentAccount) return console.log("Wrong login or password");
  loggedIn = currentAccount;
  inputLogin.value = inputPassword.value = "";
  brand.textContent = `Welcome ${currentAccount.owner.firstName}`;
  watchDiv.classList.remove("hide");
  setInterval(() => {
    const now = new Date();
    hour.textContent = now.getHours().toString().padStart(2, "0");
    minute.textContent = now.getMinutes().toString().padStart(2, "0");
    second.textContent = now.getSeconds().toString().padStart(2, "0");
  }, 1000);
  cardOwner.textContent = `${currentAccount.owner.firstName} ${currentAccount.owner.lastName}`;
  cardNumber.textContent = `${currentAccount.cardNumber.substring(
    0,
    4
  )} **** **** ${currentAccount.cardNumber.substring(12)}`;
  cardDate.textContent = `${currentAccount.expireDate}`;
  loginForm.classList.add("hide");
  btnExit.classList.remove("hide");
  main.classList.remove("hide");
  updateSummary();
});

btnSend.addEventListener("click", (event) => {
  event.preventDefault();
  const transferUser = users.find(
    (el) =>
      el.cardNumber === transferTo.value &&
      el.cardNumber !== loggedIn.cardNumber
  );
  if (!transferUser || +transferAmount.value <= 0) return;
  const exchangeRate = loggedIn.currency === "USD" ? 13000 : 1 / 13000;
  const convertedAmount = +transferAmount.value * exchangeRate;
  transferUser.transfers.push({
    amount: convertedAmount,
    date: new Date().toISOString(),
    name: loggedIn.owner.firstName + " " + loggedIn.owner.lastName,
  });
  loggedIn.transfers.push({
    amount: -+transferAmount.value,
    date: new Date().toISOString(),
    name: transferUser.owner.firstName + " " + transferUser.owner.lastName,
  });
  updateSummary();
  transferTo.value = transferAmount.value = "";
});

btnExit.addEventListener("click", () => {
  watchDiv.classList.add("hide");
  main.classList.add("hide");
  loginForm.classList.remove("hide");
  btnExit.classList.add("hide");
  brand.textContent = "See you again!";
  setTimeout(() => (brand.textContent = "Payment App"), 2000);
  loggedIn = null;
});
