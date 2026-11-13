import React, { useEffect, useState } from 'react';
import { feesApi, UserSession } from '../api';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  Plus, 
  X, 
  ArrowRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

interface FeesViewProps {
  user: UserSession;
}

export const FeesView: React.FC<FeesViewProps> = ({ user }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'defaulters' | 'ledger'>('invoices');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [payMsg, setPayMsg] = useState<{ type: 'success' | 'error'; text: string; receipt?: string } | null>(null);

  useEffect(() => {
    loadFeesData();
  }, []);

  const loadFeesData = async () => {
    try {
      const studentId = user.role === 'STUDENT' ? (user.studentId || undefined) : undefined;
      const [invData, defData, payData] = await Promise.all([
        feesApi.getInvoices(studentId),
        user.role === 'ADMIN' ? feesApi.getDefaulters() : Promise.resolve([]),
        feesApi.getPayments()
      ]);
      setInvoices(invData);
      setDefaulters(defData);
      setPayments(payData);
    } catch (err) {
      console.error('Failed to load fees data:', err);
    }
  };

  const handleOpenPay = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPayAmount(parseFloat(invoice.balance_amount));
    setShowPayModal(true);
    setPayMsg(null);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayMsg(null);
    try {
      const result = await feesApi.pay({
        invoiceId: selectedInvoice.invoice_id,
        amountPaid: payAmount,
        paymentMode,
        transactionReference: `TXN-PORTAL-${Date.now()}`
      });

      setPayMsg({
        type: 'success',
        text: `Transaction Committed: ${result.message}`,
        receipt: result.receiptNumber
      });
      loadFeesData();
    } catch (err: any) {
      setPayMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fees & Financial Transactions</h1>
          <p className="text-xs text-slate-500">Double-entry ledger, scholarship offsets & ACID transactional payment processing</p>
        </div>

        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invoices Ledger
          </button>
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('defaulters')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'defaulters' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fee Defaulters ({defaulters.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ledger' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payments Audit
          </button>
        </div>
      </div>

      {/* VIEW 1: Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Semester Fee Invoices</h2>
              <p className="text-xs text-slate-500">Gross receivables, scholarship deductions, and outstanding dues</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
              Table: fee_invoices
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-right">Gross (INR)</th>
                  <th className="py-3 px-4 text-right">Scholarship</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {invoices.map(inv => (
                  <tr key={inv.invoice_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-indigo-600">{inv.invoice_number}</td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-800">{inv.student_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.university_roll_no}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 font-medium">{inv.semester_code}</td>
                    <td className="py-3 px-4 text-right text-slate-500">₹{Number(inv.gross_amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                      -₹{Number(inv.scholarship_deduction).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      ₹{Number(inv.net_payable).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={Number(inv.balance_amount) > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        ₹{Number(inv.balance_amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {Number(inv.balance_amount) > 0 ? (
                        <button
                          onClick={() => handleOpenPay(inv)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          Pay Dues
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Defaulters */}
      {activeTab === 'defaulters' && (
        <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-rose-950">Outstanding Institutional Defaulters</h2>
              <p className="text-xs text-rose-700">Calculated via database view <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">vw_fee_defaulters</code></p>
            </div>
            <span className="text-xs font-mono bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md font-bold">
              {defaulters.length} Unsettled Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4 text-right">Unrecovered Balance</th>
                  <th className="py-3 px-4 text-center">Days Overdue</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {defaulters.map((d, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/20">
                    <td className="py-3 px-4 font-bold text-rose-700">{d.university_roll_no}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">{d.student_name}</td>
                    <td className="py-3 px-4 font-sans text-slate-600">{d.program_name}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      ₹{Number(d.balance_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                        {d.days_overdue} days
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">{d.guardian_contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Payment Audit Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Payments Audit Ledger</h2>
              <p className="text-xs text-slate-500">Atomic settlements processed through stored procedure <code className="text-slate-800 bg-slate-100 font-mono px-1.5 py-0.5 rounded border border-slate-200">sp_process_fee_payment</code></p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
              Table: payments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Invoice Ref</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 text-right">Amount Settled</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Settled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {payments.map(p => (
                  <tr key={p.payment_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-emerald-700">{p.receipt_number}</td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{p.invoice_number}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-800">{p.student_name}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">₹{Number(p.amount_paid).toLocaleString()}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {p.payment_mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{p.transaction_reference}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{new Date(p.payment_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Fee Modal (ACID Stored Procedure) */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">Settle Semester Tuition Dues</h2>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {payMsg && (
              <div className={`mt-4 p-3 rounded-xl text-xs flex flex-col gap-1 ${
                payMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {payMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
                  {payMsg.text}
                </div>
                {payMsg.receipt && (
                  <div className="font-mono text-xs bg-emerald-100/70 p-2 rounded border border-emerald-200 mt-1">
                    Official Receipt ID: <strong>{payMsg.receipt}</strong>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleProcessPayment} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-600">₹{Number(selectedInvoice.balance_amount).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Settlement Amount (INR)</label>
                <input
                  type="number"
                  step="100"
                  required
                  max={selectedInvoice.balance_amount}
                  value={payAmount}
                  onChange={e => setPayAmount(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  <option value="UPI">UPI (Unified Payments Interface)</option>
                  <option value="ONLINE_GATEWAY">Online Gateway (Razorpay/Stripe)</option>
                  <option value="NET_BANKING">Net Banking (NEFT/RTGS)</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEMAND_DRAFT">Demand Draft (Counter)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  Execute ACID Payment (FOR UPDATE Lock)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

