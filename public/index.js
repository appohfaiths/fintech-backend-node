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
(function connectSocket() {
    socket = io();
    socket.on('notification', (message) => {
        showNotification(message);
    });
})();

function showNotification(message) {
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification';
    notificationElement.textContent = message;
    document.getElementById('notifications').appendChild(notificationElement);
    setTimeout(() => notificationElement.remove(), 3000);
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
            if (data.code === 201) {
                showNotification('Sign up successful. Please check your email for confirmation code.');
                document.getElementById('signupSection').style.display = 'none';
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
            if (data.code === 201) {
                showNotification('Email confirmed successfully. You can now log in.');
                document.getElementById('emailConfirmationSection').style.display = 'none';
                showWalletSection();
            } else {
                showNotification('Email confirmation failed: ' + data.message);
            }
        })
        .catch(error => showNotification('Error: ' + error.message));
}

function showWalletSection() {
    document.getElementById('walletSection').style.display = 'block';
    document.getElementById('sendMoneySection').style.display = 'block';
    document.getElementById('transactionSection').style.display = 'block';
}

function fetchWalletBalance(id) {
    const walletBalance = document.getElementById('walletBalance');
    fetch(`/api/wallet/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                walletBalance.textContent = `${data.data.balance}`;
            } else {
                showNotification('Error fetching balance: ' + data.message);
            }
        })
        .catch(error => showNotification('Error fetching balance: ' + error.message));
}

function topUp() {
    const amount = document.getElementById('topupAmount').value;
    const walletId = document.getElementById('walletId').value;
    const walletBalance = document.getElementById('walletBalance');

    fetch(`/api/wallet/${walletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 201) {
                walletBalance.textContent = `${data.data.balance}`;
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
            if(data.code === 200) {
                const transactionList = document.getElementById('transactionHistory');
                transactionList.innerHTML = '';
                data.data.forEach(transaction => {
                    const li = document.createElement('li');
                    li.textContent = `${transaction.type}:\n${transaction.amount} USD\n${transaction.createdAt}\n${transaction.type === 'debit' ? 'Recipient' : 'Sender'}: ${transaction.type === 'debit' ? transaction.recipient.email : transaction.sender.email}`;
                    transactionList.appendChild(li);
                });
            } else {
                showNotification('Error fetching transactions: ' + data.message);
            }
        })
        .catch(error => showNotification('Error fetching transactions: ' + error.message));
}