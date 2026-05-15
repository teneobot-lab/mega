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
import ItemCategoryForm from "./pages/master/ItemCategoryForm";
import ItemCategories from "./pages/master/ItemCategories";
import UomForm from "./pages/master/UomForm";
import Uoms from "./pages/master/Uoms";
import CurrencyForm from "./pages/master/CurrencyForm";
import Currencies from "./pages/master/Currencies";
import TaxForm from "./pages/master/TaxForm";
import Taxes from "./pages/master/Taxes";
import ProjectForm from "./pages/master/ProjectForm";
import Projects from "./pages/master/Projects";
import DepartmentForm from "./pages/master/DepartmentForm";
import Departments from "./pages/master/Departments";
import Salesman from "./pages/master/Salesman";
import SalesmanForm from "./pages/master/SalesmanForm";
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
import PurchaseInvoiceForm from "./pages/purchasing/PurchaseInvoiceForm";
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
import GeneralJournalForm from "./pages/accounting/GeneralJournalForm";
import Ledger from "./pages/accounting/Ledger";
import BalanceSheet from "./pages/accounting/BalanceSheet";
import IncomeStatement from "./pages/accounting/IncomeStatement";
import RecurringTransactions from "./pages/accounting/RecurringTransactions";

import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import StockData from "./pages/inventory/StockData";
import StockAdjustmentForm from "./pages/inventory/StockAdjustmentForm";
import StockTransferForm from "./pages/inventory/StockTransferForm";
import StockCard from "./pages/inventory/StockCard";

import Receipt from "./pages/finance/Receipt";

import FixedAssets from "./pages/assets/FixedAssets";
import FixedAssetForm from "./pages/assets/FixedAssetForm";
import SalesInvoiceForm from "./pages/sales/SalesInvoiceForm";
import SalesOrderForm from "./pages/sales/SalesOrderForm";
import ContactForm from "./pages/master/ContactForm";
import PurchaseReceiptForm from "./pages/purchasing/PurchaseReceiptForm";
import SalesReturnForm from "./pages/sales/SalesReturnForm";
import SalesPaymentForm from "./pages/sales/SalesPaymentForm";
import SalesDeliveryForm from "./pages/sales/SalesDeliveryForm";
import TransferBankForm from "./pages/finance/TransferBankForm";
import AccountForm from "./pages/master/AccountForm";
import PurchasePaymentForm from "./pages/purchasing/PurchasePaymentForm";
import PurchaseReturnForm from "./pages/purchasing/PurchaseReturnForm";
import ItemForm from "./pages/master/ItemForm";
import WarehouseForm from "./pages/master/WarehouseForm";
import ReportCenter from "./pages/reports/ReportCenter";
import TrialBalance from "./pages/reports/TrialBalance";
import SalesReport from "./pages/reports/SalesReport";
import PurchaseReport from "./pages/reports/PurchaseReport";
import StockCardReport from "./pages/reports/StockCardReport";
import TaxReport from "./pages/reports/TaxReport";
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
            <Route path="/master/salesman" element={<Salesman />} />
            <Route path="/master/salesman/new" element={<SalesmanForm />} />
            <Route path="/master/salesman/:id" element={<SalesmanForm />} />
            <Route path="/master/departments" element={<Departments />} />
            <Route path="/master/departments/new" element={<DepartmentForm />} />
            <Route path="/master/departments/:id" element={<DepartmentForm />} />
            <Route path="/master/projects" element={<Projects />} />
            <Route path="/master/projects/new" element={<ProjectForm />} />
            <Route path="/master/projects/:id" element={<ProjectForm />} />
            <Route path="/master/taxes" element={<Taxes />} />
            <Route path="/master/taxes/new" element={<TaxForm />} />
            <Route path="/master/taxes/:id" element={<TaxForm />} />
            <Route path="/master/currencies" element={<Currencies />} />
            <Route path="/master/currencies/new" element={<CurrencyForm />} />
            <Route path="/master/currencies/:id" element={<CurrencyForm />} />
            <Route path="/master/uom" element={<Uoms />} />
            <Route path="/master/uom/new" element={<UomForm />} />
            <Route path="/master/uom/:id" element={<UomForm />} />
            <Route path="/master/item-categories" element={<ItemCategories />} />
            <Route path="/master/item-categories/new" element={<ItemCategoryForm />} />
            <Route path="/master/item-categories/:id" element={<ItemCategoryForm />} />
            <Route path="/accounts" element={<ChartOfAccounts />} />
            <Route path="/accounts/new" element={<AccountForm />} />
            <Route path="/accounts/:id" element={<AccountForm />} />
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
            <Route path="/purchasing/receipt/new" element={<PurchaseReceiptForm />} />
            <Route path="/purchasing/receipt/:id" element={<PurchaseReceiptForm />} />
            <Route path="/purchasing/invoice" element={<PurchaseInvoice />} />
            <Route path="/purchasing/invoice/new" element={<PurchaseInvoiceForm />} />
            <Route path="/purchasing/invoice/:id" element={<PurchaseInvoiceForm />} />
            <Route path="/purchasing/payment" element={<PurchasePayment />} />
            <Route path="/purchasing/payment/new" element={<PurchasePaymentForm />} />
            <Route path="/purchasing/payment/:id" element={<PurchasePaymentForm />} />
            <Route path="/purchasing/return" element={<PurchaseReturn />} />
            <Route path="/purchasing/return/new" element={<PurchaseReturnForm />} />
            <Route path="/purchasing/return/:id" element={<PurchaseReturnForm />} />

            {/* Sales */}
            <Route path="/sales" element={<SalesDashboard />} />
            <Route path="/sales/so" element={<SalesOrder />} />
            <Route path="/sales/so/new" element={<SalesOrderForm />} />
            <Route path="/sales/so/:id" element={<SalesOrderForm />} />
            <Route path="/sales/delivery" element={<SalesDelivery />} />
            <Route path="/sales/delivery/new" element={<SalesDeliveryForm />} />
            <Route path="/sales/delivery/:id" element={<SalesDeliveryForm />} />
            <Route path="/sales/invoice" element={<SalesInvoice />} />
            <Route path="/sales/payment" element={<SalesPayment />} />
            <Route path="/sales/payment/new" element={<SalesPaymentForm />} />
            <Route path="/sales/payment/:id" element={<SalesPaymentForm />} />
            <Route path="/sales/return" element={<SalesReturn />} />
            <Route path="/sales/return/new" element={<SalesReturnForm />} />
            <Route path="/sales/return/:id" element={<SalesReturnForm />} />

            {/* Finance / Kas & Bank */}
            <Route path="/cash-bank" element={<FinanceDashboard />} />
            <Route path="/cash-bank/transfer" element={<TransferBank />} />
            <Route path="/cash-bank/transfer/new" element={<TransferBankForm />} />
            <Route path="/cash-bank/transfer/:id" element={<TransferBankForm />} />
            <Route path="/cash-bank/expense" element={<Expense />} />
            <Route path="/cash-bank/receipt" element={<Receipt />} />

            {/* Accounting */}
            <Route path="/accounting" element={<AccountingDashboard />} />
            <Route path="/accounting/journals" element={<GeneralJournal />} />
            <Route path="/accounting/journals/new" element={<GeneralJournalForm />} />
            <Route path="/accounting/journals/:id" element={<GeneralJournalForm />} />
            <Route path="/accounting/ledger" element={<Ledger />} />
            <Route path="/accounting/balance-sheet" element={<BalanceSheet />} />
            <Route path="/accounting/income-statement" element={<IncomeStatement />} />
            <Route path="/accounting/recurring" element={<RecurringTransactions />} />

            {/* Assets */}
            <Route path="/assets" element={<FixedAssets />} />
            <Route path="/assets/fixed/new" element={<FixedAssetForm />} />
            <Route path="/assets/fixed/:id" element={<FixedAssetForm />} />

            {/* Sales */}
            <Route path="/sales/invoice/new" element={<SalesInvoiceForm />} />
            <Route path="/sales/invoice/:id" element={<SalesInvoiceForm />} />
            
            {/* Reports */}
            <Route path="/reports" element={<ReportCenter />} />
            <Route path="/reports/trial-balance" element={<TrialBalance />} />
            <Route path="/reports/sales" element={<SalesReport />} />
            <Route path="/reports/purchase" element={<PurchaseReport />} />
            <Route path="/reports/stock-card" element={<StockCardReport />} />
            <Route path="/reports/tax" element={<TaxReport />} />
            <Route path="/reports/ar-aging" element={<ARAging />} />
            <Route path="/reports/ap-aging" element={<APAging />} />
            <Route path="/reports/cash-flow" element={<CashFlow />} />

            {/* Inventory */}
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/inventory/stocks" element={<StockData />} />
            <Route path="/inventory/stock-card" element={<StockCard />} />
            <Route path="/inventory/adjustment/new" element={<StockAdjustmentForm />} />
            <Route path="/inventory/adjustment/:id" element={<StockAdjustmentForm />} />
            <Route path="/inventory/transfer/new" element={<StockTransferForm />} />
            <Route path="/inventory/transfer/:id" element={<StockTransferForm />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  );
}
