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
    const users = getStorage('registered_users', []);
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (!foundUser) {
      throw { response: { data: { message: "Invalid username or password" } } };
    }

    const token = "mock-jwt-token-" + Date.now();
    localStorage.setItem('token', token);
    setStorage('user', { ...foundUser, password: '***' }); // Don't store plain password in session user object
    
    return { data: { token, user: foundUser } };
  },
  register: async (username, password) => {
    await delay(500);
    const users = getStorage('registered_users', []);
    
    if (users.find(u => u.username === username)) {
      throw { response: { data: { message: "User already exists" } } };
    }

    const newUser = { 
      id: Date.now(), 
      username, 
      password, 
      fullName: username,
      email: `${username}@example.com` 
    };
    
    users.push(newUser);
    setStorage('registered_users', users);
    
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
    const data = getStorage('transactions', []);
    return { data };
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
    if (url === '/categories/user') {
      const cats = getStorage('userCategories', []);
      return Promise.resolve({ data: cats });
    }
    return Promise.resolve({ data: {} });
  },
  post: (url, data) => {
    if (url === '/auth/login') return authService.login(data.username, data.password);
    if (url === '/auth/register') return authService.register(data.username, data.password);
    if (url === '/user/details') return userService.updateDetails(data);
    if (url === '/transactions') {
      const newTx = {
        ...data,
        id: Date.now(),
        category: { name: data.categoryName || 'Other' },
        date: data.date || new Date().toISOString()
      };
      const transactions = getStorage('transactions', []);
      transactions.push(newTx);
      setStorage('transactions', transactions);
      return Promise.resolve({ data: newTx });
    }
    if (url === '/categories/user') {
      const CATEGORY_NAMES = {
        1: 'Groceries', 2: 'Rent', 3: 'Dining', 4: 'Transport', 5: 'Utilities',
        6: 'Healthcare', 7: 'Entertainment', 8: 'Shopping', 9: 'Gym', 10: 'Education',
        11: 'Travel', 12: 'Pet Care', 13: 'Laundry', 14: 'House Help', 15: 'Grooming',
        16: 'Gifts', 17: 'Streaming', 18: 'Water', 19: 'Taxes', 20: 'Insurance',
        21: 'Charity', 22: 'Coffee', 23: 'Subscriptions', 24: 'Maintenance'
      };
      const updatedCats = data.map(uc => ({
        id: uc.categoryId,
        selected: uc.isSelected,
        customAmount: uc.customAmount,
        category: { id: uc.categoryId, name: CATEGORY_NAMES[uc.categoryId] || 'Other' }
      }));
      setStorage('userCategories', updatedCats);
      return Promise.resolve({ data: updatedCats });
    }
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
