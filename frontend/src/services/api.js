// Mock API Service - Works 100% in the browser without a real backend
// This allows the website to work on Netlify immediately.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Local Storage Helper
const getStorage = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const authService = {
  login: async (username, password) => {
    await delay(500);
    // For demo purposes, any username/password works!
    const user = { 
      id: 1, 
      username: username || 'Guest', 
      email: `${username || 'guest'}@example.com` 
    };
    const token = "mock-jwt-token-" + Date.now();
    
    localStorage.setItem('token', token);
    setStorage('user', user);
    
    return { data: { token, user } };
  },
  register: async (username, password) => {
    await delay(500);
    return { data: { message: "User registered successfully!" } };
  },
};

export const userService = {
  getDetails: async () => {
    await delay(300);
    const user = getStorage('user', { 
      id: 1, 
      username: 'User', 
      savings: 5000,
      totalBalance: 10000 
    });
    return { data: user };
  },
  updateDetails: async (data) => {
    await delay(300);
    const current = getStorage('user', {});
    const updated = { ...current, ...data };
    setStorage('user', updated);
    return { data: updated };
  },
};

export const transactionService = {
  getAll: async () => {
    await delay(400);
    return { data: getStorage('transactions', []) };
  },
  add: async (data) => {
    await delay(300);
    const transactions = getStorage('transactions', []);
    const newTransaction = { 
      ...data, 
      id: Date.now(),
      date: data.date || new Date().toISOString() 
    };
    transactions.push(newTransaction);
    setStorage('transactions', transactions);
    return { data: newTransaction };
  },
  delete: async (id) => {
    await delay(300);
    const transactions = getStorage('transactions', []);
    const filtered = transactions.filter(t => t.id !== id);
    setStorage('transactions', filtered);
    return { data: { success: true } };
  },
};

// Dummy Axios instance for compatibility
const api = {
  get: (url) => {
    if (url === '/user/details') return userService.getDetails();
    if (url === '/transactions') return transactionService.getAll();
    return Promise.resolve({ data: {} });
  },
  post: (url, data) => {
    if (url === '/auth/login') return authService.login(data.username, data.password);
    if (url === '/auth/register') return authService.register(data.username, data.password);
    if (url === '/user/details') return userService.updateDetails(data);
    if (url === '/transactions') return transactionService.add(data);
    return Promise.resolve({ data: {} });
  },
  delete: (url) => {
    const id = url.split('/').pop();
    return transactionService.delete(parseInt(id));
  },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

export default api;
