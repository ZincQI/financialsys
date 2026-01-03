// API Service Layer

// 后端 Host 统一配置：
// - 默认指向部署服务器: http://39.97.44.219:5000
// - 可通过 Vite 环境变量 VITE_API_HOST 覆盖
const API_HOST = import.meta.env.VITE_API_HOST || 'http://39.97.44.219:5000';
const API_BASE_URL = `${API_HOST}/api`;

// Generic fetch function with error handling
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Accounts API
export const AccountAPI = {
  // Get all accounts
  getAllAccounts: async () => {
    return fetchAPI('/accounts');
  },
  
  // Get account tree structure
  getAccountTree: async () => {
    return fetchAPI('/accounts/tree');
  },
  
  // Get account by GUID
  getAccount: async (guid: string) => {
    return fetchAPI(`/accounts/${guid}`);
  },
  
  // Get account transaction count
  getAccountTransactionCount: async (guid: string) => {
    return fetchAPI(`/accounts/${guid}/transaction-count`);
  },
  
  // Create new account
  createAccount: async (accountData: any) => {
    return fetchAPI('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  },
  
  // Delete account by GUID
  deleteAccount: async (guid: string) => {
    return fetchAPI(`/accounts/${guid}`, {
      method: 'DELETE',
    });
  },
  
  // Update account (only name)
  updateAccount: async (guid: string, name: string) => {
    return fetchAPI(`/accounts/${guid}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },
  
  // Get account transactions
  getAccountTransactions: async (guid: string) => {
    return fetchAPI(`/accounts/${guid}/transactions`);
  },
  
  // Quick entry from account (快速记账)
  createQuickEntry: async (accountGuid: string, entryData: any) => {
    return fetchAPI(`/accounts/${accountGuid}/quick-entry`, {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },
};

// Transactions API
export const TransactionAPI = {
  // Get all transactions
  getTransactions: async (startDate?: string, endDate?: string) => {
    let url = '/transactions';
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      url += `?${params.toString()}`;
    }
    return fetchAPI(url);
  },
  
  // Get transaction by GUID
  getTransaction: async (guid: string) => {
    return fetchAPI(`/transactions/${guid}`);
  },
  
  // Create new transaction
  createTransaction: async (transactionData: any) => {
    return fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },
};

// Reports API
export const ReportAPI = {
  // Get balance sheet
  getBalanceSheet: async (date: string) => {
    return fetchAPI(`/reports/balance-sheet?date=${date}`);
  },
  
  // Get income statement
  getIncomeStatement: async (startDate: string, endDate: string) => {
    return fetchAPI(`/reports/income-statement?start_date=${startDate}&end_date=${endDate}`);
  },
  
  // Get cash flow statement
  getCashFlowStatement: async (startDate: string, endDate: string) => {
    return fetchAPI(`/reports/cash-flow?start_date=${startDate}&end_date=${endDate}`);
  },
  
  // Get dashboard data
  getDashboardData: async () => {
    return fetchAPI('/reports/dashboard');
  },
};

// Purchase Orders API
export const PurchaseOrderAPI = {
  // Get all purchase orders with pagination
  getPurchaseOrders: async (page: number = 1, perPage: number = 10) => {
    return fetchAPI(`/purchase-orders?page=${page}&per_page=${perPage}`);
  },
  
  // Get purchase order by ID
  getPurchaseOrder: async (id: string) => {
    return fetchAPI(`/purchase-orders/${id}`);
  },
  
  // Create new purchase order
  createPurchaseOrder: async (orderData: any) => {
    return fetchAPI('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  
  // Approve purchase order
  approvePurchaseOrder: async (id: string) => {
    return fetchAPI(`/purchase-orders/${id}/approve`, {
      method: 'POST',
    });
  },
};

// Suppliers API
export const SupplierAPI = {
  // Get all suppliers
  getSuppliers: async () => {
    return fetchAPI('/vendors');
  },
  
  // Get supplier by GUID
  getSupplier: async (guid: string) => {
    return fetchAPI(`/vendors/${guid}`);
  },

  // Get supplier transaction history
  getSupplierTransactions: async (guid: string) => {
    return fetchAPI(`/vendors/${guid}/transactions`);
  },
  
  // Create new supplier
  createSupplier: async (supplierData: any) => {
    return fetchAPI('/vendors', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },
  
  // Update supplier
  updateSupplier: async (guid: string, supplierData: any) => {
    return fetchAPI(`/vendors/${guid}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },
};
