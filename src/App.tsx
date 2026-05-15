/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MasterData from "./pages/master/MasterData";
import ChartOfAccounts from "./pages/master/ChartOfAccounts";
import Contacts from "./pages/master/Contacts";
import Items from "./pages/master/Items";

import Warehouses from "./pages/master/Warehouses";

import PurchasingDashboard from "./pages/purchasing/PurchasingDashboard";
import PurchaseOrder from "./pages/purchasing/PurchaseOrder";
import PurchaseOrderForm from "./pages/purchasing/PurchaseOrderForm";
import PurchaseReceipt from "./pages/purchasing/PurchaseReceipt";
import PurchaseReturn from "./pages/purchasing/PurchaseReturn";
import PurchaseInvoice from "./pages/purchasing/PurchaseInvoice";
import PurchasePayment from "./pages/purchasing/PurchasePayment";

import SalesDashboard from "./pages/sales/SalesDashboard";
import SalesOrder from "./pages/sales/SalesOrder";
import SalesDelivery from "./pages/sales/SalesDelivery";
import SalesReturn from "./pages/sales/SalesReturn";
import SalesInvoice from "./pages/sales/SalesInvoice";
import SalesPayment from "./pages/sales/SalesPayment";

import FinanceDashboard from "./pages/finance/FinanceDashboard";
import TransferBank from "./pages/finance/TransferBank";
import Expense from "./pages/finance/Expense";

import AccountingDashboard from "./pages/accounting/AccountingDashboard";
import GeneralJournal from "./pages/accounting/GeneralJournal";
import Ledger from "./pages/accounting/Ledger";
import BalanceSheet from "./pages/accounting/BalanceSheet";
import IncomeStatement from "./pages/accounting/IncomeStatement";
import RecurringTransactions from "./pages/accounting/RecurringTransactions";

import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import StockData from "./pages/inventory/StockData";
import StockCard from "./pages/inventory/StockCard";

import Receipt from "./pages/finance/Receipt";

import FixedAssets from "./pages/assets/FixedAssets";
import SalesInvoiceForm from "./pages/sales/SalesInvoiceForm";
import SalesOrderForm from "./pages/sales/SalesOrderForm";
import ContactForm from "./pages/master/ContactForm";
import ItemForm from "./pages/master/ItemForm";
import WarehouseForm from "./pages/master/WarehouseForm";
import ReportCenter from "./pages/reports/ReportCenter";
import ARAging from "./pages/reports/ARAging";
import APAging from "./pages/reports/APAging";
import CashFlow from "./pages/reports/CashFlow";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            {/* Master Data */}
            <Route path="/master" element={<MasterData />} />
            <Route path="/accounts" element={<ChartOfAccounts />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/new" element={<ContactForm />} />
            <Route path="/contacts/:id" element={<ContactForm />} />
            <Route path="/items" element={<Items />} />
            <Route path="/items/new" element={<ItemForm />} />
            <Route path="/items/:id" element={<ItemForm />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/warehouses/new" element={<WarehouseForm />} />
            <Route path="/warehouses/:id" element={<WarehouseForm />} />
            
            {/* Purchasing */}
            <Route path="/purchasing" element={<PurchasingDashboard />} />
            <Route path="/purchasing/po" element={<PurchaseOrder />} />
            <Route path="/purchasing/po/new" element={<PurchaseOrderForm />} />
            <Route path="/purchasing/po/:id" element={<PurchaseOrderForm />} />
            <Route path="/purchasing/receipt" element={<PurchaseReceipt />} />
            <Route path="/purchasing/invoice" element={<PurchaseInvoice />} />
            <Route path="/purchasing/payment" element={<PurchasePayment />} />
            <Route path="/purchasing/return" element={<PurchaseReturn />} />

            {/* Sales */}
            <Route path="/sales" element={<SalesDashboard />} />
            <Route path="/sales/so" element={<SalesOrder />} />
            <Route path="/sales/so/new" element={<SalesOrderForm />} />
            <Route path="/sales/so/:id" element={<SalesOrderForm />} />
            <Route path="/sales/delivery" element={<SalesDelivery />} />
            <Route path="/sales/invoice" element={<SalesInvoice />} />
            <Route path="/sales/payment" element={<SalesPayment />} />
            <Route path="/sales/return" element={<SalesReturn />} />

            {/* Finance / Kas & Bank */}
            <Route path="/cash-bank" element={<FinanceDashboard />} />
            <Route path="/cash-bank/transfer" element={<TransferBank />} />
            <Route path="/cash-bank/expense" element={<Expense />} />
            <Route path="/cash-bank/receipt" element={<Receipt />} />

            {/* Accounting */}
            <Route path="/accounting" element={<AccountingDashboard />} />
            <Route path="/accounting/journals" element={<GeneralJournal />} />
            <Route path="/accounting/ledger" element={<Ledger />} />
            <Route path="/accounting/balance-sheet" element={<BalanceSheet />} />
            <Route path="/accounting/income-statement" element={<IncomeStatement />} />
            <Route path="/accounting/recurring" element={<RecurringTransactions />} />

            {/* Assets */}
            <Route path="/assets" element={<FixedAssets />} />

            {/* Sales */}
            <Route path="/sales/invoice/new" element={<SalesInvoiceForm />} />
            <Route path="/sales/invoice/:id" element={<SalesInvoiceForm />} />
            
            {/* Reports */}
            <Route path="/reports" element={<ReportCenter />} />
            <Route path="/reports/ar-aging" element={<ARAging />} />
            <Route path="/reports/ap-aging" element={<APAging />} />
            <Route path="/reports/cash-flow" element={<CashFlow />} />

            {/* Inventory */}
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/inventory/stocks" element={<StockData />} />
            <Route path="/inventory/stock-card" element={<StockCard />} />
            <Route path="/inventory/transfer" element={<StockData />} />
            <Route path="/inventory/adjust" element={<StockData />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  );
}
