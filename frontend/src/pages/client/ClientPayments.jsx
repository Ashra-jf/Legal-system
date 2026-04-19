import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Upload, Download, FileText, CheckCircle, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { paymentService } from '../../api/paymentService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ClientPayments({ userId }) {
  const [payments, setPayments] = useState([]);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showViewReceiptDialog, setShowViewReceiptDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [userId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPayments();
      // Optionally map db fields here if needed.
      const mapped = data.map(p => ({
        ...p,
        invoiceId: p.invoice_id || `PAY-${p.id}`,
        service: p.service_name || (p.case_id ? `Case #${p.case_id}` : 'General Service'),
        amount: Number(p.amount) || 0,
        date: p.payment_date ? p.payment_date.split('T')[0] : 'N/A',
        receiptUrl: p.receipt_url,
        paymentMethod: p.payment_method
      }));
      setPayments(mapped);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case 'pending verification':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending Verification</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !paymentDate || !transactionRef || !paymentMethod) {
      toast.error('Please fill in all fields and upload receipt');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('paymentDate', paymentDate);
      formData.append('transactionRef', transactionRef);
      formData.append('paymentMethod', paymentMethod);

      await paymentService.uploadReceipt(selectedPayment.id, formData);
      toast.success('Receipt uploaded successfully! Awaiting admin verification.');

      loadPayments();
      setShowReceiptDialog(false);
      setReceiptFile(null);
      setPaymentDate('');
      setTransactionRef('');
      setPaymentMethod('');
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
    }
  };

  const handleViewInvoice = (payment) => {
    setSelectedInvoice(payment);
    setShowInvoiceDialog(true);
  };

  const handleDownloadInvoice = () => {
    if (!selectedInvoice) return;
    
    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(10, 35, 66); // Dark Blue (#0A2342)
      pdf.text('DNJ Legal Firm', 20, 25);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100); // Gray
      pdf.text('UE Perera Mawatha', 20, 35);
      pdf.text('Colombo, Sri Lanka', 20, 40);
      pdf.text('+94 11 234 5678', 20, 45);

      pdf.setTextColor(0, 0, 0); // Black
      pdf.setFontSize(12);
      pdf.text(`Invoice ID: ${selectedInvoice.invoiceId}`, 130, 25);
      pdf.text(`Date: ${selectedInvoice.date}`, 130, 32);
      
      // Divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 52, 190, 52);

      // Body Details
      pdf.setFontSize(12);
      let startY = 65;
      
      pdf.setTextColor(100, 100, 100);
      pdf.text('Service:', 20, startY);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${selectedInvoice.service}`, 80, startY);
      
      startY += 12;
      pdf.setTextColor(100, 100, 100);
      pdf.text('Amount:', 20, startY);
      pdf.setTextColor(10, 35, 66);
      pdf.text(`Rs. ${selectedInvoice.amount.toLocaleString()}`, 80, startY);

      startY += 12;
      pdf.setTextColor(100, 100, 100);
      pdf.text('Payment Method:', 20, startY);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${selectedInvoice.paymentMethod}`, 80, startY);

      startY += 12;
      pdf.setTextColor(100, 100, 100);
      pdf.text('Status:', 20, startY);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${selectedInvoice.status}`, 80, startY);

      // Save
      pdf.save(`${selectedInvoice.invoiceId || 'Invoice'}.pdf`);
      toast.success('Invoice downloaded successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`PDF Error: ${error.message || String(error)}`);
    }
  };

  const handleViewReceipt = (payment) => {
    if (payment.receiptUrl) {
      if (payment.receiptUrl.startsWith('blob:') || payment.receiptUrl.startsWith('data:')) {
        window.open(payment.receiptUrl, '_blank');
        toast.success('Opening uploaded receipt...');
      } else {
        setSelectedReceipt(payment);
        setShowViewReceiptDialog(true);
      }
    } else {
      toast.error('No receipt associated with this payment');
    }
  };

  const totalVerified = payments
    .filter(p => p.status?.toLowerCase() === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => ['pending', 'pending verification'].includes(p.status?.toLowerCase()))
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2342]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[#0A2342] mb-2">Payments & Invoices</h1>
          <p className="text-gray-600">Upload payment receipts and view invoices</p>
        </div>
      </div>

      {/* Bank Details Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-[#0A2342] text-lg">Bank Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Bank Name</p>
              <p className="text-gray-900 font-medium">Commercial Bank of Ceylon</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Account Number</p>
              <p className="text-gray-900 font-medium">1234567890</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Account Name</p>
              <p className="text-gray-900 font-medium">DNJ Legal Firm</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Branch</p>
              <p className="text-gray-900 font-medium">Colombo Main Branch</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            💡 After making the payment, please upload your receipt below for verification.
          </p>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Verified Payments</p>
                <p className="text-[#0A2342]">Rs. {totalVerified.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Pending Payments</p>
                <p className="text-[#0A2342]">Rs. {totalPending.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Transactions</p>
                <p className="text-[#0A2342]">{payments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.invoiceId}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell>Rs. {payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.receiptUrl && payment.status?.toLowerCase() !== 'rejected' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewReceipt(payment)}
                          className="text-blue-600"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      ) : payment.status?.toLowerCase() === 'rejected' ? (
                        <span className="text-red-500 text-sm">Receipt Rejected</span>
                      ) : (
                        <span className="text-gray-400 text-sm">No receipt</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.status?.toLowerCase() === 'verified' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInvoice(payment)}
                          className="border-[#0A2342] text-[#0A2342]"
                        >
                          View Invoice
                        </Button>
                      )}
                      {(payment.status?.toLowerCase() === 'pending' || payment.status?.toLowerCase() === 'rejected') && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowReceiptDialog(true);
                          }}
                          className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload Receipt
                        </Button>
                      )}
                      {payment.status?.toLowerCase() === 'pending verification' && (
                        <span className="text-sm text-orange-600">Awaiting verification</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Upload Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Payment Receipt</DialogTitle>
            <DialogDescription>
              Upload your bank payment receipt for verification
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Invoice Amount</Label>
              <Input
                value={`Rs. ${selectedPayment?.amount.toLocaleString() || ''}`}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash Deposit">Cash Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Transaction Reference Number</Label>
              <Input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Enter transaction reference"
              />
            </div>

            <div>
              <Label>Receipt File (Image/PDF)</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files[0])}
                className="cursor-pointer"
              />
              {receiptFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {receiptFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReceiptDialog(false);
              setReceiptFile(null);
              setPaymentDate('');
              setTransactionRef('');
              setPaymentMethod('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadReceipt}
              className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Mock Receipt Dialog */}
      <Dialog open={showViewReceiptDialog} onOpenChange={setShowViewReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Viewing receipt for {selectedReceipt?.invoiceId}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl my-4">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Receipt Document</h3>
            <p className="text-sm text-gray-500 mb-1">{selectedReceipt?.receiptUrl?.split('/').pop() || 'receipt.pdf'}</p>
            <p className="text-xs text-gray-400">Mock Document Viewer</p>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowViewReceiptDialog(false)}
            >
              Close Viewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div id="invoice-capture-area" className="space-y-6 py-4 p-8 bg-white">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-[#0A2342] mb-2">DNJ Legal Firm</h2>
                  <p className="text-gray-600">UE Perera Mawatha</p>
                  <p className="text-gray-600">Colombo, Sri Lanka</p>
                  <p className="text-gray-600">+94 11 234 5678</p>
                </div>
                <div className="text-right">
                  <p className="text-[#0A2342]">{selectedInvoice.invoiceId}</p>
                  <p className="text-gray-600">Date: {selectedInvoice.date}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Service:</span>
                  <span className="text-gray-900">{selectedInvoice.service}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-[#0A2342]">Rs. {selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="text-gray-900">{selectedInvoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
                {selectedInvoice.verifiedBy && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Verified By:</span>
                    <span className="text-gray-900">{selectedInvoice.verifiedBy} on {selectedInvoice.verifiedDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
              className="border-[#0A2342] text-[#0A2342]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={() => window.print()} className="bg-[#0A2342] text-white">
              Print Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
