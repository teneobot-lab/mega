import { apiFetch } from "./api";

// MASTER
export const masterApi = {
  getAccounts: () => apiFetch("/api/master/accounts"),
  getAccount: (id: string) => apiFetch(`/api/master/accounts/${id}`),
  createAccount: (data: any) => apiFetch("/api/master/accounts", { method: "POST", body: JSON.stringify(data) }),
  updateAccount: (id: string, data: any) => apiFetch(`/api/master/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAccount: (id: string) => apiFetch(`/api/master/accounts/${id}`, { method: "DELETE" }),

  getContacts: (type?: string) => apiFetch(`/api/master/contacts${type ? `?type=${type}` : ""}`),
  getContact: (id: string) => apiFetch(`/api/master/contacts/${id}`),
  createContact: (data: any) => apiFetch("/api/master/contacts", { method: "POST", body: JSON.stringify(data) }),
  updateContact: (id: string, data: any) => apiFetch(`/api/master/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteContact: (id: string) => apiFetch(`/api/master/contacts/${id}`, { method: "DELETE" }),

  getSalesmen: () => apiFetch("/api/master/salesman"),
  
  getItems: () => apiFetch("/api/master/items"),
  getItem: (id: string) => apiFetch(`/api/master/items/${id}`),
  createItem: (data: any) => apiFetch("/api/master/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id: string, data: any) => apiFetch(`/api/master/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id: string) => apiFetch(`/api/master/items/${id}`, { method: "DELETE" }),

  getWarehouses: () => apiFetch("/api/master/warehouses"),
  getWarehouse: (id: string) => apiFetch(`/api/master/warehouses/${id}`),
  createWarehouse: (data: any) => apiFetch("/api/master/warehouses", { method: "POST", body: JSON.stringify(data) }),
  updateWarehouse: (id: string, data: any) => apiFetch(`/api/master/warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteWarehouse: (id: string) => apiFetch(`/api/master/warehouses/${id}`, { method: "DELETE" }),

  getUoms: () => apiFetch("/api/master/uom"),
  getUom: (id: string) => apiFetch(`/api/master/uom/${id}`),
  createUom: (data: any) => apiFetch("/api/master/uom", { method: "POST", body: JSON.stringify(data) }),
  updateUom: (id: string, data: any) => apiFetch(`/api/master/uom/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUom: (id: string) => apiFetch(`/api/master/uom/${id}`, { method: "DELETE" }),

  getCategories: () => apiFetch("/api/master/item-categories"),
  getCategory: (id: string) => apiFetch(`/api/master/item-categories/${id}`),
  createCategory: (data: any) => apiFetch("/api/master/item-categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => apiFetch(`/api/master/item-categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => apiFetch(`/api/master/item-categories/${id}`, { method: "DELETE" }),

  getDepartments: () => apiFetch("/api/master/departments"),
  getDepartment: (id: string) => apiFetch(`/api/master/departments/${id}`),
  createDepartment: (data: any) => apiFetch("/api/master/departments", { method: "POST", body: JSON.stringify(data) }),
  updateDepartment: (id: string, data: any) => apiFetch(`/api/master/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDepartment: (id: string) => apiFetch(`/api/master/departments/${id}`, { method: "DELETE" }),

  getProjects: () => apiFetch("/api/master/projects"),
  getProject: (id: string) => apiFetch(`/api/master/projects/${id}`),
  createProject: (data: any) => apiFetch("/api/master/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => apiFetch(`/api/master/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id: string) => apiFetch(`/api/master/projects/${id}`, { method: "DELETE" }),

  getTaxes: () => apiFetch("/api/master/taxes"),
  getTax: (id: string) => apiFetch(`/api/master/taxes/${id}`),
  createTax: (data: any) => apiFetch("/api/master/taxes", { method: "POST", body: JSON.stringify(data) }),
  updateTax: (id: string, data: any) => apiFetch(`/api/master/taxes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTax: (id: string) => apiFetch(`/api/master/taxes/${id}`, { method: "DELETE" }),

  getCurrencies: () => apiFetch("/api/master/currencies"),
  getCurrency: (id: string) => apiFetch(`/api/master/currencies/${id}`),
  createCurrency: (data: any) => apiFetch("/api/master/currencies", { method: "POST", body: JSON.stringify(data) }),
  updateCurrency: (id: string, data: any) => apiFetch(`/api/master/currencies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCurrency: (id: string) => apiFetch(`/api/master/currencies/${id}`, { method: "DELETE" }),
};

// SALES
export const salesApi = {
  getOrders: () => apiFetch("/api/sales/orders"),
  getOrder: (id: string) => apiFetch(`/api/sales/orders/${id}`),
  createOrder: (data: any) => apiFetch("/api/sales/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrder: (id: string, data: any) => apiFetch(`/api/sales/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  approveOrder: (id: string) => apiFetch(`/api/sales/orders/${id}/approve`, { method: "POST" }),
  
  getInvoices: () => apiFetch("/api/sales/invoices"),
  getInvoice: (id: string) => apiFetch(`/api/sales/invoices/${id}`),
  createInvoice: (data: any) => apiFetch("/api/sales/invoices", { method: "POST", body: JSON.stringify(data) }),
  
  getPayments: () => apiFetch("/api/sales/payments"),
  getPayment: (id: string) => apiFetch(`/api/sales/payments/${id}`),
  createPayment: (data: any) => apiFetch("/api/sales/payments", { method: "POST", body: JSON.stringify(data) }),
  updatePayment: (id: string, data: any) => apiFetch(`/api/sales/payments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  
  getReturns: () => apiFetch("/api/sales/returns"),
  getReturn: (id: string) => apiFetch(`/api/sales/returns/${id}`),
  createReturn: (data: any) => apiFetch("/api/sales/returns", { method: "POST", body: JSON.stringify(data) }),
  updateReturn: (id: string, data: any) => apiFetch(`/api/sales/returns/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  
  getDeliveries: () => apiFetch("/api/transactions/delivery"),
  getDelivery: (id: string) => apiFetch(`/api/transactions/delivery/${id}`),
  createDelivery: (data: any) => apiFetch("/api/transactions/delivery", { method: "POST", body: JSON.stringify(data) }),
  updateDelivery: (id: string, data: any) => apiFetch(`/api/transactions/delivery/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// PURCHASING
export const purchasingApi = {
  getOrders: () => apiFetch("/api/purchasing/orders"),
  getOrder: (id: string) => apiFetch(`/api/purchasing/orders/${id}`),
  createOrder: (data: any) => apiFetch("/api/purchasing/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrder: (id: string, data: any) => apiFetch(`/api/purchasing/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  approveOrder: (id: string) => apiFetch(`/api/purchasing/orders/${id}/approve`, { method: "POST" }),

  getInvoices: () => apiFetch("/api/purchasing/invoices"),
  getInvoice: (id: string) => apiFetch(`/api/purchasing/invoices/${id}`),
  createInvoice: (data: any) => apiFetch("/api/purchasing/invoices", { method: "POST", body: JSON.stringify(data) }),

  getPayments: () => apiFetch("/api/purchasing/payments"),
  getPayment: (id: string) => apiFetch(`/api/purchasing/payments/${id}`),
  createPayment: (data: any) => apiFetch("/api/purchasing/payments", { method: "POST", body: JSON.stringify(data) }),
  updatePayment: (id: string, data: any) => apiFetch(`/api/purchasing/payments/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  getReturns: () => apiFetch("/api/purchasing/returns"),
  getReturn: (id: string) => apiFetch(`/api/purchasing/returns/${id}`),
  createReturn: (data: any) => apiFetch("/api/purchasing/returns", { method: "POST", body: JSON.stringify(data) }),
  updateReturn: (id: string, data: any) => apiFetch(`/api/purchasing/returns/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  getReceipts: () => apiFetch("/api/transactions/receipt"),
  getReceipt: (id: string) => apiFetch(`/api/transactions/receipt/${id}`),
  createReceipt: (data: any) => apiFetch("/api/transactions/receipt", { method: "POST", body: JSON.stringify(data) }),
  updateReceipt: (id: string, data: any) => apiFetch(`/api/transactions/receipt/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// INVENTORY
export const inventoryApi = {
    getStocks: () => apiFetch("/api/inventory/summary"),
    createAdjustment: (data: any) => apiFetch("/api/inventory/adjustment", { method: "POST", body: JSON.stringify(data) }),
    createTransfer: (data: any) => apiFetch("/api/inventory/transfer", { method: "POST", body: JSON.stringify(data) }),
    getStockCard: (itemId: string) => apiFetch(`/api/inventory/stock-card/${itemId}`),
};

// FINANCE
export const financeApi = {
    getReceipts: () => apiFetch("/api/finance/receipts"),
    createReceipt: (data: any) => apiFetch("/api/finance/receipts", { method: "POST", body: JSON.stringify(data) }),
    getExpenses: () => apiFetch("/api/finance/expenses"),
    createExpense: (data: any) => apiFetch("/api/finance/expenses", { method: "POST", body: JSON.stringify(data) }),
    getTransfers: () => apiFetch("/api/finance/transfers"),
    createTransfer: (data: any) => apiFetch("/api/finance/transfers", { method: "POST", body: JSON.stringify(data) })
};

// ACCOUNTING
export const accountingApi = {
    getJournals: () => apiFetch("/api/accounting/journals"),
    getJournal: (id: string) => apiFetch(`/api/accounting/journals/${id}`),
    createJournal: (data: any) => apiFetch("/api/accounting/journals", { method: "POST", body: JSON.stringify(data) }),
    getLedger: (params: any) => apiFetch(`/api/accounting/ledger?accountId=${params.accountId}&startDate=${params.startDate}&endDate=${params.endDate}`),
    getBalanceSheet: (date: string) => apiFetch(`/api/accounting/balance-sheet?date=${date}`),
    getIncomeStatement: (from: string, to: string) => apiFetch(`/api/accounting/income-statement?startDate=${from}&endDate=${to}`),
};

// ASSETS
export const assetsApi = {
    getAssets: () => apiFetch("/api/assets"),
    getAsset: (id: string) => apiFetch(`/api/assets/${id}`),
    createAsset: (data: any) => apiFetch("/api/assets", { method: "POST", body: JSON.stringify(data) }),
    updateAsset: (id: string, data: any) => apiFetch(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    disposeAsset: (id: string, data: any) => apiFetch(`/api/assets/${id}/dispose`, { method: "POST", body: JSON.stringify(data) }),
};

// DASHBOARD
export const dashboardApi = {
    getSummary: () => apiFetch("/api/dashboard/summary"),
};

// REPORTS
export const reportsApi = {
    getTrialBalance: (from: string, to: string) => apiFetch(`/api/reports/trial-balance?startDate=${from}&endDate=${to}`),
    getSales: (from: string, to: string) => apiFetch(`/api/reports/sales?startDate=${from}&endDate=${to}`),
    getPurchase: (from: string, to: string) => apiFetch(`/api/reports/purchase?startDate=${from}&endDate=${to}`),
    getTax: (from: string, to: string) => apiFetch(`/api/reports/tax?startDate=${from}&endDate=${to}`),
    getArAging: (date: string) => apiFetch(`/api/reports/ar-aging?date=${date}`),
    getApAging: (date: string) => apiFetch(`/api/reports/ap-aging?date=${date}`),
    getCashFlow: (from: string, to: string) => apiFetch(`/api/reports/cash-flow?startDate=${from}&endDate=${to}`),
    getStockCard: (itemId: string, from: string, to: string) => apiFetch(`/api/reports/stock-card?itemId=${itemId}&startDate=${from}&endDate=${to}`),
};

// RECURRING
export const recurringApi = {
    getRecurring: () => apiFetch("/api/recurring"),
    executeRecurring: (id: string) => apiFetch(`/api/recurring/${id}/execute`, { method: "POST" }),
};

// SYSTEM & AUTH
export const systemApi = {
    login: (data: any) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    initSystem: () => apiFetch("/api/setup/init", { method: "POST" }),
};
