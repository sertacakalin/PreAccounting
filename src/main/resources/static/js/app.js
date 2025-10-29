document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const adminView = document.getElementById('admin-view');
    const customerView = document.getElementById('customer-view');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Admin elements
    const createCustomerForm = document.getElementById('create-customer-form');
    const createCustomerResult = document.getElementById('create-customer-result');
    const listCustomersButton = document.getElementById('list-customers-button');
    const customersList = document.getElementById('customers-list');
    const customerInvoiceSelect = document.getElementById('customer-invoice-select');
    const listInvoicesButton = document.getElementById('list-invoices-button');
    const invoicesListAdmin = document.getElementById('invoices-list-admin');
    const adminReportForm = document.getElementById('admin-report-form');
    const adminReportResult = document.getElementById('admin-report-result');

    // Customer elements
    const createInvoiceForm = document.getElementById('create-invoice-form');
    const listMyInvoicesButton = document.getElementById('list-my-invoices-button');
    const invoicesListCustomer = document.getElementById('invoices-list-customer');
    const customerReportForm = document.getElementById('customer-report-form');
    const customerReportResult = document.getElementById('customer-report-result');

    let currentToken = null;
    let currentUserRole = null;
    let currentUserId = null;
    let currentCustomerId = null;

    const API_BASE_URL = ''; // Spring Boot serves from root

    // --- Utility Functions ---
    function showView(view) {
        loginView.classList.add('hidden');
        adminView.classList.add('hidden');
        customerView.classList.add('hidden');
        userInfo.classList.add('hidden');

        if (view === 'admin') {
            adminView.classList.remove('hidden');
            userInfo.classList.remove('hidden');
        } else if (view === 'customer') {
            customerView.classList.remove('hidden');
            userInfo.classList.remove('hidden');
        } else {
            loginView.classList.remove('hidden');
        }
    }

    function setAuthData(token, userId, username, role, customerId) {
        currentToken = token;
        currentUserId = userId;
        usernameDisplay.textContent = `Logged in as: ${username} (${role})`;
        currentUserRole = role;
        currentCustomerId = customerId;
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_id', userId);
        localStorage.setItem('username', username);
        localStorage.setItem('user_role', role);
        localStorage.setItem('customer_id', customerId);
        checkAuthAndRender();
    }

    function clearAuthData() {
        currentToken = null;
        currentUserId = null;
        usernameDisplay.textContent = '';
        currentUserRole = null;
        currentCustomerId = null;
        localStorage.clear();
        checkAuthAndRender();
    }

    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
        };
    }

    async function fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            alert(`Error: ${error.message}`);
            return null;
        }
    }

    // --- Authentication ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        const username = e.target.username.value;
        const password = e.target.password.value;

        const data = await fetchData(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (data) {
            setAuthData(data.token, data.userId, data.username, data.role, data.customerId);
        } else {
            loginError.textContent = 'Login failed. Please check your credentials.';
        }
    });

    logoutButton.addEventListener('click', () => {
        clearAuthData();
    });

    function checkAuthAndRender() {
        const token = localStorage.getItem('jwt_token');
        const role = localStorage.getItem('user_role');
        const username = localStorage.getItem('username');
        const userId = localStorage.getItem('user_id');
        const customerId = localStorage.getItem('customer_id');

        if (token && role && username && userId) {
            currentToken = token;
            currentUserRole = role;
            usernameDisplay.textContent = `Logged in as: ${username} (${role})`;
            currentUserId = userId;
            currentCustomerId = customerId;

            if (currentUserRole === 'ADMIN') {
                showView('admin');
                loadCustomersForAdmin();
            } else if (currentUserRole === 'CUSTOMER') {
                showView('customer');
                listMyInvoices();
            } else {
                showView('login');
            }
        } else {
            showView('login');
        }
    }

    // --- Admin Functions ---
    async function loadCustomersForAdmin() {
        const customers = await fetchData(`${API_BASE_URL}/api/admin/customers`, {
            headers: getAuthHeaders()
        });
        if (customers) {
            customersList.innerHTML = '';
            customerInvoiceSelect.innerHTML = '<option value="">Select Customer</option>';
            customers.forEach(customer => {
                const li = document.createElement('li');
                li.textContent = `ID: ${customer.id}, Name: ${customer.name}, Email: ${customer.email}`;
                customersList.appendChild(li);

                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.name} (ID: ${customer.id})`;
                customerInvoiceSelect.appendChild(option);
            });
        }
    }

    createCustomerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        createCustomerResult.textContent = '';
        const name = document.getElementById('customer-name').value;
        const email = document.getElementById('customer-email').value;
        const phone = document.getElementById('customer-phone').value;
        const taxNo = document.getElementById('customer-taxNo').value;
        const address = document.getElementById('customer-address').value;

        const data = await fetchData(`${API_BASE_URL}/api/admin/customers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, email, phone, taxNo, address })
        });

        if (data) {
            createCustomerResult.textContent = `Customer created: ${data.name} (ID: ${data.customerId})`;
            createCustomerResult.classList.remove('error-message');
            createCustomerResult.classList.add('success-message');
            createCustomerForm.reset();
            loadCustomersForAdmin();
        } else {
            createCustomerResult.textContent = 'Failed to create customer.';
            createCustomerResult.classList.remove('success-message');
            createCustomerResult.classList.add('error-message');
        }
    });

    listCustomersButton.addEventListener('click', loadCustomersForAdmin);

    listInvoicesButton.addEventListener('click', async () => {
        const customerId = customerInvoiceSelect.value;
        if (!customerId) {
            alert('Please select a customer.');
            return;
        }
        const invoices = await fetchData(`${API_BASE_URL}/api/admin/invoices?customerId=${customerId}`, {
            headers: getAuthHeaders()
        });
        if (invoices) {
            invoicesListAdmin.innerHTML = '';
            invoices.forEach(invoice => {
                const li = document.createElement('li');
                li.textContent = `ID: ${invoice.id}, Type: ${invoice.type}, Amount: ${invoice.amount}, Date: ${invoice.date}`;
                invoicesListAdmin.appendChild(li);
            });
        }
    });

    adminReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminReportResult.innerHTML = '';
        const fromDate = document.getElementById('admin-from-date').value;
        const toDate = document.getElementById('admin-to-date').value;

        const report = await fetchData(`${API_BASE_URL}/api/admin/reports/summary?from=${fromDate}&to=${toDate}`, {
            headers: getAuthHeaders()
        });

        if (report) {
            adminReportResult.innerHTML = `
                <p>From: ${report.fromDate} To: ${report.toDate}</p>
                <p>Total Income: ${report.totalIncome}</p>
                <p>Total Expense: ${report.totalExpense}</p>
                <p>Net Profit: ${report.netProfit}</p>
                <p>Invoice Count: ${report.invoiceCount}</p>
            `;
        }
    });

    // --- Customer Functions ---
    createInvoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = document.getElementById('invoice-type').value;
        const date = document.getElementById('invoice-date').value;
        const amount = document.getElementById('invoice-amount').value;
        const description = document.getElementById('invoice-description').value;

        const data = await fetchData(`${API_BASE_URL}/api/customer/invoices`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ type, date, amount, description })
        });

        if (data) {
            alert(`Invoice created: ID ${data.id}, Amount: ${data.amount}`);
            createInvoiceForm.reset();
            listMyInvoices();
        }
    });

    async function listMyInvoices() {
        const invoices = await fetchData(`${API_BASE_URL}/api/customer/invoices`, {
            headers: getAuthHeaders()
        });
        if (invoices) {
            invoicesListCustomer.innerHTML = '';
            invoices.forEach(invoice => {
                const li = document.createElement('li');
                li.textContent = `ID: ${invoice.id}, Type: ${invoice.type}, Amount: ${invoice.amount}, Date: ${invoice.date}`;
                invoicesListCustomer.appendChild(li);
            });
        }
    }

    listMyInvoicesButton.addEventListener('click', listMyInvoices);

    customerReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        customerReportResult.innerHTML = '';
        const fromDate = document.getElementById('customer-from-date').value;
        const toDate = document.getElementById('customer-to-date').value;

        const report = await fetchData(`${API_BASE_URL}/api/customer/report/summary?from=${fromDate}&to=${toDate}`, {
            headers: getAuthHeaders()
        });

        if (report) {
            customerReportResult.innerHTML = `
                <p>From: ${report.fromDate} To: ${report.toDate}</p>
                <p>Total Income: ${report.totalIncome}</p>
                <p>Total Expense: ${report.totalExpense}</p>
                <p>Net Profit: ${report.netProfit}</p>
                <p>Invoice Count: ${report.invoiceCount}</p>
            `;
        }
    });

    // Initial check on page load
    checkAuthAndRender();
});
