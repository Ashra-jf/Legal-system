import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { CreditCard, TrendingUp, DollarSign, Eye, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { paymentService } from '../../api/paymentService';

export default function AdminPaymentMonitoring() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  React.useEffect(() => {
    loadPayments(true);

    // Setup background polling every 10 seconds
    const interval = setInterval(() => {
      loadPayments(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadPayments = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await paymentService.getPayments();
      // map to match UI fields
      setPayments(data.map(p => ({
        ...p,
        id: p.id.toString(),
        invoiceId: p.invoice_id || `PAY-${p.id}`,
        client: p.client_name,
        service: p.service_name || (p.case_id ? `Case #${p.case_id}` : 'General Service'),
        amount: Number(p.amount),
        date: p.payment_date ? p.payment_date.split('T')[0] : 'N/A',
        status: p.status === 'pending' ? 'Pending Verification' : p.status.charAt(0).toUpperCase() + p.status.slice(1),
        method: p.payment_method || 'Online',
        receiptUrl: p.receipt_url,
        transactionRef: p.transaction_id || '-',
        uploadedDate: p.created_at ? p.created_at.split('T')[0] : 'N/A'
      })));
    } catch(e) {
      console.error(e);
      // Suppress silent errors to prevent toast spam during background polling
      if (showSpinner) toast.error('Failed to view payments');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case 'Pending Verification':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending Verification</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptDialog(true);
  };

  const handleApprovePayment = async () => {
    try {
      await paymentService.verifyPayment(selectedPayment.id, 'verified');
      toast.success('Payment verified successfully! Payment details updated.');
      setShowReceiptDialog(false);
      setSelectedPayment(null);
      loadPayments();
    } catch(e) {
      toast.error('Failed to verify payment');
    }
  };

  const handleRejectPayment = async () => {
    try {
      await paymentService.verifyPayment(selectedPayment.id, 'rejected');
      toast.error('Payment rejected. Client will be notified to reupload receipt.');
      setShowReceiptDialog(false);
      setSelectedPayment(null);
      loadPayments();
    } catch(e) {
      toast.error('Failed to reject payment');
    }
  };

  const stats = {
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    verifiedRevenue: payments.filter(p => p.status === 'Verified').reduce((sum, p) => sum + p.amount, 0),
    pendingRevenue: payments.filter(p => p.status === 'Pending' || p.status === 'Pending Verification').reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    verifiedTransactions: payments.filter(p => p.status === 'Verified').length,
    pendingVerification: payments.filter(p => ['Pending', 'pending', 'Pending Verification'].includes(p.status)).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2342]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0A2342] mb-2">Payment Monitoring</h1>
        <p className="text-gray-600">Track all payments and verify uploaded receipts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Revenue</p>
                <p className="text-[#0A2342]">Rs. {stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.totalTransactions} transactions</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Verified Revenue</p>
                <p className="text-green-600">Rs. {stats.verifiedRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.verifiedTransactions} verified</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Pending Verification</p>
                <p className="text-orange-600">{stats.pendingVerification}</p>
                <p className="text-sm text-gray-500 mt-1">Needs review</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Payment Methods Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#E5F1FB] rounded-lg">
              <p className="text-gray-600 mb-1">Bank Transfer</p>
              <p className="text-[#0A2342]">
                {payments.filter(p => p.method === 'Bank Transfer').length} transactions
              </p>
            </div>
            <div className="p-4 bg-[#E5F1FB] rounded-lg">
              <p className="text-gray-600 mb-1">Cash Deposit</p>
              <p className="text-[#0A2342]">
                {payments.filter(p => p.method === 'Cash Deposit').length} transactions
              </p>
            </div>
            <div className="p-4 bg-[#E5F1FB] rounded-lg">
              <p className="text-gray-600 mb-1">Pending</p>
              <p className="text-[#0A2342]">
                {payments.filter(p => !p.method).length} transactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.invoiceId}</TableCell>
                    <TableCell>{payment.client}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell>Rs. {payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.method || '-'}</TableCell>
                    <TableCell>
                      {payment.receiptUrl ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReceipt(payment)}
                          className="border-[#0A2342] text-[#0A2342]"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Receipt
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">No receipt</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Verification Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt Verification</DialogTitle>
            <DialogDescription>
              Review the uploaded payment receipt and approve or reject
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice ID:</span>
                  <span className="font-medium">{selectedPayment.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{selectedPayment.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{selectedPayment.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-[#0A2342]">Rs. {selectedPayment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{selectedPayment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Reference:</span>
                  <span className="font-medium">{selectedPayment.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded Date:</span>
                  <span className="font-medium">{selectedPayment.uploadedDate || selectedPayment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Receipt File:</p>
                <div className="bg-white p-4 border rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">{selectedPayment.receiptUrl?.split('/').pop() || 'receipt.pdf'}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                  >
                    Open File
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex w-full sm:justify-between">
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
              Close
            </Button>
            {selectedPayment?.status === 'Pending Verification' ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleRejectPayment}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprovePayment}
                  className="bg-[#0A2342] hover:bg-[#0A2342]/90 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Verify
                </Button>
              </div>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
