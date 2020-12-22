'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const account5 = {
  owner: 'Uday Paleti',
  movements: [100, 1000, -700, -50, -90, 3000, 2000, -1000],
  interestRate: 1,
  pin: 5555,
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelInterest = document.querySelector('.summary__value--interest');
const labelMessage = document.querySelector('.welcome');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnClose = document.querySelector('.form__btn--close');
const btnLoan = document.querySelector('.form__btn--loan');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUser = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferName = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputCloseUser = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');

let currentAccount;
let sorted = false;

// Create username
const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(userSplitEl => userSplitEl[0])
      .join('');
  });
};
createUserNames(accounts);

// Display the movements
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';
  const sortMovements = sort
    ? movements.slice().sort((a, b) => a - b)
    : movements;
  sortMovements.forEach(function (movement, i) {
    const movementType = movement > 0 ? 'deposit' : 'withdrawal';
    const movementHtml = `<div class="movements__row">
                      <div class="movements__type movements__type--${movementType}">
                      ${i + 1}: ${movementType}
                      </div>
                      <div class="movements__value">${movement} \u20AC</div>
                    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', movementHtml);
  });
};

// Calculate and print balance
function calcDisplayBalance(account) {
  account.balance = account.movements.reduce((acc, movement) => {
    return acc + movement;
  }, 0);
  labelBalance.textContent = `${account.balance}\u20AC`;
}

// Calculate and print summary
function calcDisplaySummary(account) {
  const income = account.movements
    .filter(movement => movement > 0)
    .reduce((acc, deposit) => acc + deposit, 0);
  labelSumIn.textContent = `${income}\u20AC`;

  const out = account.movements
    .filter(movement => movement < 0)
    .reduce((acc, withdrawal) => acc + withdrawal, 0);
  labelSumOut.textContent = `${Math.abs(out)}\u20AC`;

  const interest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(interest => interest > 1)
    .reduce((acc, interest) => acc + interest, 0);
  labelInterest.textContent = `${interest}\u20AC`;
}

function updateUI(account) {
  displayMovements(account.movements);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
}

// Login
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  //Read the account owner
  currentAccount = accounts.find(function (account) {
    return account.userName === inputLoginUser.value;
  });
  // Check if pin entered and current pin matches
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Clear input fields and remove focus
    inputLoginUser.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // Show screen
    containerApp.style.opacity = 100;
    // Display welcome message
    labelMessage.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    labelMessage.style.color = '#39b385';
    // Display total balance, summary
    updateUI(currentAccount);
  } else {
    // Clear input fields
    inputLoginUser.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // Hide screen
    containerApp.style.opacity = 0;
    // Display error message
    labelMessage.textContent = `Wrong Username or PIN! Please enter correct details`;
    labelMessage.style.color = 'red';
  }
});

// Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    account => account.userName === inputTransferName.value
  );
  inputTransferName.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
  // Check if amount and user entered is valid
  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currentAccount.balance &&
    receiverAcc.userName !== currentAccount.userName
  ) {
    // If yes reduce balance, add to movements and display in UI
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);
    updateUI(currentAccount);
  } else {
    labelMessage.textContent = `Sorry ${
      currentAccount.owner.split(' ')[0]
    }, transfer is invalid`;
  }
});

// Loan -- Given only if atleast one deposit which is 10% of loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some(movement => movement >= 0.1 * amount)
  ) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
    labelMessage.textContent = `Loan for ${amount}\u20AC is granted`;
  } else {
    labelMessage.textContent = `Sorry ${
      currentAccount.owner.split(' ')[0]
    }, loan cannot be granted`;
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

// Close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUser.value === currentAccount.userName &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    // Delete that account from accounts and hide UI
    const index = accounts.findIndex(
      account => account.userName === currentAccount.userName
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelMessage.textContent = `${
      currentAccount.owner.split(' ')[0]
    } user account is closed`;
    labelMessage.style.color = 'black';
  }
  inputCloseUser.value = inputClosePin.value = '';
  inputClosePin.blur();
});

// Sort
btnSort.addEventListener('click', function () {
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
