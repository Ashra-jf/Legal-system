import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { FileText, Save, Clock, MapPin, Hash, Calendar, ChevronLeft, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { caseService } from '../../api/caseService';

export default function LawyerCaseUpdates({ lawyerId }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [caseStatus, setCaseStatus] = useState('');
  const [caseNotes, setCaseNotes] = useState('');
  const [caseUpdatesTimeline, setCaseUpdatesTimeline] = useState([]);
  
  // Extra detailed editable fields
  const [caseCourtName, setCaseCourtName] = useState('');
  const [caseFilingDate, setCaseFilingDate] = useState('');
  const [caseNextHearingDate, setCaseNextHearingDate] = useState('');

  React.useEffect(() => {
    loadCases();
  }, [lawyerId]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await caseService.getCases();
      const mapped = data.map(c => ({
        ...c,
        id: c.id.toString(),
        caseId: c.case_id || `CAS-${c.id}`,
        caseNumber: c.case_number || 'N/A',
        title: c.title,
        clientName: c.client_name,
        clientContact: 'Client Contact Hidden',
        assignedLawyer: c.lawyer_name || 'Assigned',
        currentStatus: c.status || 'Pending',
        caseType: c.case_type || 'General',
        filingDate: c.filing_date ? c.filing_date.split('T')[0] : 'N/A',
        lastUpdate: c.updated_at ? c.updated_at.split('T')[0] : 'N/A',
        courtName: c.court_name || 'N/A',
        nextHearingDate: c.next_hearing_date ? c.next_hearing_date.split('T')[0] : 'N/A'
      }));
      setCases(mapped);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const handleCaseSelect = async (caseId) => {
    const selectedCaseData = cases.find((c) => c.id === caseId);
    if (selectedCaseData) {
      setSelectedCaseId(caseId);
      // Map it to exact db status if it diverges from generic display strings, else direct string
      setCaseStatus(selectedCaseData.currentStatus.toLowerCase().replace(' ', '_'));
      setCaseNotes(''); // Reset notes when switching cases
      setCaseCourtName(selectedCaseData.courtName !== 'N/A' ? selectedCaseData.courtName : '');
      setCaseFilingDate(selectedCaseData.filingDate !== 'N/A' ? selectedCaseData.filingDate : '');
      setCaseNextHearingDate(selectedCaseData.nextHearingDate !== 'N/A' ? selectedCaseData.nextHearingDate : '');
      try {
        const updates = await caseService.getCaseUpdates(caseId);
        setCaseUpdatesTimeline(updates || []);
      } catch (err) {
        setCaseUpdatesTimeline([]);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedCaseId('');
    setCaseStatus('');
    setCaseNotes('');
    setCaseUpdatesTimeline([]);
    setCaseCourtName('');
    setCaseFilingDate('');
    setCaseNextHearingDate('');
  };

  const handleUpdateCase = async () => {
    if (!caseStatus) {
      toast.error('Please select a status');
      return;
    }
    if (!caseNotes.trim()) {
      toast.error('Please add case notes');
      return;
    }

    try {
      // 1. Update the overall case status and metadata in the cases table
      await caseService.updateCase(selectedCaseId, { 
        status: caseStatus,
        court_name: caseCourtName || null,
        filing_date: caseFilingDate || null,
        next_hearing_date: caseNextHearingDate || null
      });
      // 2. Log the official note into case_updates
      await caseService.addCaseUpdate(selectedCaseId, { 
        update_type: 'note', 
        title: 'Lawyer Update', 
        description: caseNotes
      });
      
      toast.success('Case updated successfully!');
      loadCases();
      
      // Reload timeline immediately
      const updates = await caseService.getCaseUpdates(selectedCaseId);
      setCaseUpdatesTimeline(updates || []);
      setCaseNotes('');
    } catch(e) {
       console.error('Failed to update', e);
       const errorMsg = e?.response?.data?.error || e?.message || 'Unknown error';
       toast.error('Failed to update case: ' + errorMsg);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toString().toLowerCase();
    const statusConfig = {
      'open': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'in_progress': { className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'pending_review': { className: 'bg-orange-100 text-orange-800 border-orange-200' },
      'closed': { className: 'bg-green-100 text-green-800 border-green-200' },
      'won': { className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      'lost': { className: 'bg-red-100 text-red-800 border-red-200' },
      'settled': { className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    };

    const config = statusConfig[s] || { className: 'bg-gray-100 text-gray-800 border-gray-200' };
    const label = s ? s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unknown';
    return <Badge className={config.className}>{label}</Badge>;
  };

  // ---------------------------------------------------------------------------
  // VIEW RENDERERS
  // ---------------------------------------------------------------------------

  const renderMasterTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A2342]" />
        </div>
      );
    }
    
    return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#0A2342] text-xl">Active Caseload Overview</CardTitle>
        <CardDescription>Select any case to view details and publish official updates.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID & Number</TableHead>
                <TableHead>Title & Client</TableHead>
                <TableHead>Next Hearing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-medium text-[#0A2342]">{caseItem.caseId}</div>
                    <div className="text-sm text-gray-500">{caseItem.caseNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{caseItem.title}</div>
                    <div className="text-sm text-gray-500">{caseItem.clientName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      {caseItem.nextHearingDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(caseItem.currentStatus)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCaseSelect(caseItem.id)}
                      className="border-[#0A2342] text-[#0A2342] hover:bg-[#0A2342] hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Update Case
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    );
  };

  const renderDetailView = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <Button
        variant="ghost"
        onClick={handleBackToList}
        className="text-gray-500 hover:text-[#0A2342] -ml-2 h-8"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Caseload
      </Button>

      {/* Top Section: Rich Case Details Card */}
      <Card className="border-gray-200 border-t-4 border-t-[#0A2342] shadow-sm">
        <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{selectedCase.caseId}</span>
                {getStatusBadge(selectedCase.currentStatus)}
              </div>
              <CardTitle className="text-2xl text-[#0A2342]">{selectedCase.title}</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-[#E5F1FB] text-[#0A2342] font-medium px-4 py-1.5 text-sm h-fit">
              {selectedCase.caseType}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Column 1: Court Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Court Details
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 block text-xs">Court Name</span>
                  <span className="text-gray-900 font-medium text-sm">{selectedCase.courtName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Official Case Number</span>
                  <span className="text-gray-900 font-medium text-sm">{selectedCase.caseNumber}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Timeline
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 block text-xs">Filing Date</span>
                  <span className="text-gray-900 font-medium text-sm">{selectedCase.filingDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Next Hearing Date</span>
                  <span className="text-indigo-700 font-semibold text-sm">{selectedCase.nextHearingDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Last Updated</span>
                  <span className="text-gray-900 text-sm">{selectedCase.lastUpdate}</span>
                </div>
              </div>
            </div>

            {/* Column 3: Personnel */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-3.5 h-3.5" /> Personnel
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 block text-xs">Client Contact</span>
                  <span className="text-gray-900 font-medium text-sm block">{selectedCase.clientName}</span>
                  <span className="text-gray-500 text-xs">{selectedCase.clientContact}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Assigned Lawyer</span>
                  <span className="text-gray-900 font-medium text-sm">{selectedCase.assignedLawyer}</span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Middle Section: Activity Timeline with Client Queries highlighted */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-[#0A2342] flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Recent Activity & Client Queries
            </CardTitle>
            {caseUpdatesTimeline.filter(u => u.title === 'Client Query').length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                {caseUpdatesTimeline.filter(u => u.title === 'Client Query').length} pending {caseUpdatesTimeline.filter(u => u.title === 'Client Query').length === 1 ? 'query' : 'queries'} from client
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 max-h-[350px] overflow-y-auto">
          {caseUpdatesTimeline.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No updates or queries logged yet.</p>
          ) : (
            <div className="space-y-3">
              {caseUpdatesTimeline.map(update => {
                const isClientQuery = update.title === 'Client Query';
                return (
                  <div key={update.id} className={`p-3 rounded-lg border ${
                    isClientQuery 
                      ? 'bg-orange-50 border-orange-200 border-l-4 border-l-orange-400' 
                      : 'bg-white border-gray-100 shadow-sm'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold text-sm ${
                        isClientQuery ? 'text-orange-700' : 'text-[#0A2342]'
                      }`}>
                        {isClientQuery ? '❗ Client Query' : '📋 ' + update.title}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(update.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{update.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      From: {update.updated_by_name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Section: Update Form */}
      <Card className="border-gray-200 shadow-xl shadow-gray-200/40">
        <CardHeader className="bg-[#0A2342] text-white rounded-t-xl">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Save className="w-5 h-5 text-gray-300" /> Track New Case Activity
          </CardTitle>
          <CardDescription className="text-gray-300">
            Log official updates and change the public status of the case.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-4xl space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="status" className="text-gray-700 font-semibold mb-1.5 block">Update Public Status</Label>
                <Select value={caseStatus} onValueChange={setCaseStatus}>
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Select new status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="settled">Settled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                 <Label htmlFor="courtName" className="text-gray-700 font-semibold mb-1.5 block">Court Name</Label>
                 <input 
                    id="courtName"
                    type="text"
                    value={caseCourtName}
                    onChange={(e) => setCaseCourtName(e.target.value)}
                    placeholder="e.g., Supreme Court"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A2342] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                 />
              </div>

              <div>
                 <Label htmlFor="filingDate" className="text-gray-700 font-semibold mb-1.5 block">Filing Date</Label>
                 <input 
                    id="filingDate"
                    type="date"
                    value={caseFilingDate}
                    onChange={(e) => setCaseFilingDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A2342] focus:border-transparent"
                 />
              </div>

              <div>
                 <Label htmlFor="nextHearingDate" className="text-gray-700 font-semibold mb-1.5 block">Next Hearing Date</Label>
                 <input 
                    id="nextHearingDate"
                    type="date"
                    value={caseNextHearingDate}
                    onChange={(e) => setCaseNextHearingDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A2342] focus:border-transparent"
                 />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-gray-700 font-semibold flex items-baseline justify-between block mb-1.5">
                Official Case Notes
                <span className="text-xs font-normal text-gray-400">Example: "Client submitted land docs. Waiting for verification."</span>
              </Label>
              <Textarea
                id="notes"
                value={caseNotes}
                onChange={(e) => setCaseNotes(e.target.value)}
                placeholder="Enter thorough, official notes detailing the latest developments or required actions..."
                className="min-h-[160px] resize-y border-gray-300 focus:ring-[#0A2342]"
              />
            </div>

            <div className="pt-4 flex justify-start">
              <Button
                onClick={handleUpdateCase}
                className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90 h-10 w-fit px-6 text-sm shadow-md"
              >
                Publish Case Update
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-[#0A2342] tracking-tight mb-2">Lawyer Case Management</h1>
        <p className="text-gray-500">Track your caseload, review detailed timelines, and publish official updates.</p>
      </div>

      {selectedCaseId ? renderDetailView() : renderMasterTable()}

    </div>
  );
}
