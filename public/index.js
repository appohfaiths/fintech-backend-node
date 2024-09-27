document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signupButton').addEventListener('click', signup);
    document.getElementById('confirmEmailButton').addEventListener('click', confirmEmail);
    document.getElementById('topUpButton').addEventListener('click', topUp);
    document.getElementById('sendMoneyButton').addEventListener('click', sendMoney);
    document.getElementById('getTransactionsButton').addEventListener('click', fetchTransactions);
});

let socket;
let currentUser;

// Connect to Socket.IO server
function connectSocket() {
    socket = io();
    socket.on('notification', (message) => {
        showNotification(message);
    });
}

function showNotification(message) {
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification';
    notificationElement.textContent = message;
    document.getElementById('notifications').appendChild(notificationElement);
    setTimeout(() => notificationElement.remove(), 5000);
}

function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!username || !email || !password) {
        showNotification('All fields are required.');
        return;
    }

    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Sign up successful. Please check your email for confirmation code.');
                document.getElementById('emailConfirmationSection').style.display = 'block';
            } else {
                showNotification('Sign up failed: ' + data.message);
            }
        })
        .catch(error => showNotification('Error: ' + error.message));
}

function confirmEmail() {
    const code = document.getElementById('confirmationCode').value;

    fetch(`/api/auth/verify-email/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Email confirmed successfully. You can now log in.');
                document.getElementById('emailConfirmationSection').style.display = 'none';
            } else {
                showNotification('Email confirmation failed: ' + data.message);
            }
        })
        .catch(error => showNotification('Error: ' + error.message));
}

function showWalletSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('walletSection').style.display = 'block';
    document.getElementById('sendMoneySection').style.display = 'block';
    document.getElementById('transactionSection').style.display = 'block';
    fetchWalletBalance();
}

function fetchWalletBalance(id) {
    fetch(`/api/wallet/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('walletBalance').textContent = data.balance;
        })
        .catch(error => showNotification('Error fetching balance: ' + error.message));
}

function topUp() {
    const amount = document.getElementById('topupAmount').value;
    const walletId = document.getElementById('walletId').value;

    fetch(`/api/wallet/${walletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 201) {
                showNotification('Top up successful');
            } else {
                showNotification('Top up failed: ' + data.message);
            }
        })
        .catch(error => showNotification('Error: ' + error.message));
}

function sendMoney() {
    const receiverWalletId = document.getElementById('receiverWalletId').value.trim();
    const senderWalletId = document.getElementById('senderWalletId').value.trim();
    const idempotencyKey = document.getElementById('idempotencyKey').value.trim();
    const amount = document.getElementById('sendAmount').value;

    fetch('/api/transactions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverWalletId, senderWalletId, idempotencyKey, amount })
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 201) {
                showNotification('Money sent successfully');
                fetchWalletBalance(receiverWalletId);
            } else {
                showNotification('Send money failed: ' + data.message);
            }
        })
        .catch(error => showNotification('Error: ' + error.message));
}

function fetchTransactions() {
    const userId = document.getElementById('userId').value.trim();
    fetch(`/api/transactions/${userId}`)
        .then(response => response.json())
        .then(data => {
            const transactionList = document.getElementById('transactionHistory');
            transactionList.innerHTML = '';
            data.data.forEach(transaction => {
                const li = document.createElement('li');
                li.textContent = `${transaction.type}: ${transaction.amount} Recipient: ${transaction.recipient.email} USD - ${new Date(transaction.createdAt).toLocaleString()}`;
                transactionList.appendChild(li);
            });
        })
        .catch(error => showNotification('Error fetching transactions: ' + error.message));
}