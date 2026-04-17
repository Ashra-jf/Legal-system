import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { FileText, Calendar, AlertCircle, Loader2, Send, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { caseService } from '../../api/caseService';
import { toast } from 'sonner@2.0.3';

export default function ClientCaseStatus({ userId }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState({});
  const [expandedTimelines, setExpandedTimelines] = useState({});

  useEffect(() => {
    loadCases();
  }, [userId]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await caseService.getCases();
      const casesWithUpdates = await Promise.all(
        data.map(async (c) => {
          try {
            const updates = await caseService.getCaseUpdates(c.id);
            return { ...c, updates: updates || [] };
          } catch (e) {
            return { ...c, updates: [] };
          }
        })
      );
      setCases(casesWithUpdates);
    } catch (error) {
      console.error('Error loading cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (caseId, text) => {
    setQueries((prev) => ({ ...prev, [caseId]: text }));
  };

  const handleSendQuery = async (caseId) => {
    const text = queries[caseId];
    if (!text || !text.trim()) {
      toast.error("Query cannot be empty");
      return;
    }

    try {
      await caseService.addCaseUpdate(caseId, {
        update_type: 'note',
        title: 'Client Query',
        description: text.trim()
      });
      toast.success("Query sent successfully to your lawyer.");
      
      // Clear input and reload this specific case's updates
      handleQueryChange(caseId, '');
      loadCases(); // Simply reload all to ensure full sync
    } catch (error) {
      console.error('Error sending query:', error);
      toast.error('Failed to send query');
    }
  };

  const toggleTimeline = (caseId) => {
    setExpandedTimelines((prev) => ({
      ...prev,
      [caseId]: !prev[caseId]
    }));
  };

  const getStatusBadge = (status) => {
    const s = status?.toString().toLowerCase();
    const statusConfig = {
      'open': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'in_progress': { className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'pending_review': { className: 'bg-orange-100 text-orange-800 border-orange-200' },
      'closed': { className: 'bg-gray-100 text-gray-800 border-gray-200' },
      'won': { className: 'bg-green-100 text-green-800 border-green-200' },
      'lost': { className: 'bg-red-100 text-red-800 border-red-200' },
      'settled': { className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    };

    const config = statusConfig[s] || { className: 'bg-gray-100 text-gray-800 border-gray-200' };
    const label = s ? s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unknown';
    return <Badge className={config.className}>{label}</Badge>;
  };

  const getProgressPercentage = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 10;
      case 'pending_review': return 30;
      case 'in_progress': return 60;
      case 'settled': return 80;
      case 'closed':
      case 'won':
      case 'lost': return 100;
      default: return 0;
    }
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
        <h1 className="text-[#0A2342] mb-2 text-2xl font-semibold">Case Status</h1>
        <p className="text-gray-600">Track the progress of your legal cases</p>
      </div>

      {cases.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No active cases</p>
              <p className="text-gray-500">Your cases will appear here once you book a service</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {cases.map((caseItem) => {
            const progress = getProgressPercentage(caseItem.status);
            // Only show LAWYER updates in the "Latest Update" box
            const lawyerUpdates = caseItem.updates.filter(u => u.title !== 'Client Query');
            const latestUpdate = lawyerUpdates.length > 0 ? lawyerUpdates[0] : null;
            const isTimelineExpanded = expandedTimelines[caseItem.id];

            return (
              <Card key={caseItem.id} className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-white pb-4 border-b border-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-[#0A2342] text-lg font-medium">{caseItem.title}</CardTitle>
                      <CardDescription className="text-gray-500 mt-1">{caseItem.description}</CardDescription>
                    </div>
                    {getStatusBadge(caseItem.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-6 bg-gray-50/50">
                  {/* Progress Bar Area */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 text-sm font-medium">Progress</span>
                      <span className="text-[#0A2342] text-sm font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-gray-200" />
                  </div>

                  {/* Latest Update Box */}
                  <div className="bg-[#E5F1FB] p-4 rounded-xl border border-blue-100/50 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#0A2342] mt-0.5" />
                      <div className="w-full">
                        <p className="text-[#0A2342] font-semibold text-sm mb-1">Latest Update</p>
                        {latestUpdate ? (
                          <>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{latestUpdate.description}</p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">
                              {new Date(latestUpdate.created_at).toLocaleString()} • {latestUpdate.updated_by_name}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Lawyer has not posted any official updates yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates / Timeline Toggle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Last Updated</p>
                        <p className="text-gray-900 font-medium text-sm">
                          {caseItem.updated_at ? new Date(caseItem.updated_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Next Hearing / Appt</p>
                          <p className="text-indigo-700 font-medium text-sm">
                            {caseItem.next_hearing_date ? new Date(caseItem.next_hearing_date).toLocaleDateString() : 'To be assigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ask a Question / Query Interface */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[#0A2342] text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Message Your Lawyer
                      </h4>
                      {caseItem.updates.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-gray-500 hover:text-[#0A2342]"
                          onClick={() => toggleTimeline(caseItem.id)}
                        >
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          {isTimelineExpanded ? 'Hide History' : 'View Full History'}
                          {isTimelineExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                        </Button>
                      )}
                    </div>

                    {isTimelineExpanded && caseItem.updates.length > 0 && (
                      <div className="mb-6 space-y-3 bg-white p-4 rounded-lg border border-gray-200 max-h-[300px] overflow-y-auto shadow-inner">
                        {caseItem.updates.map(update => {
                          const isClientQuery = update.title === 'Client Query';
                          return (
                            <div key={update.id} className={`pb-3 border-b border-gray-100 last:border-0 last:pb-0 p-2 rounded ${isClientQuery ? 'bg-blue-50 border-l-4 border-l-blue-400' : 'bg-green-50 border-l-4 border-l-green-400'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold text-xs ${isClientQuery ? 'text-blue-700' : 'text-green-700'}`}>
                                  {isClientQuery ? '💬 Your Query' : '📋 Lawyer Update'}
                                </span>
                                <span className="text-[10px] text-gray-400">{new Date(update.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{update.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <Textarea 
                        placeholder="Type any questions, concerns, or updates for your lawyer here..."
                        className="resize-none h-20 text-sm focus:ring-[#0A2342] border-gray-300"
                        value={queries[caseItem.id] || ''}
                        onChange={(e) => handleQueryChange(caseItem.id, e.target.value)}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleSendQuery(caseItem.id)}
                        className="self-end bg-[#0A2342] text-white hover:bg-[#0A2342]/90 flex items-center shadow-md"
                      >
                        <Send className="w-3.5 h-3.5 mr-2" /> Send Query
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
