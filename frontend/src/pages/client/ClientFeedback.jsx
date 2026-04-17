import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Star, Upload, Video, X, Briefcase, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { feedbackService } from '../../api/feedbackService';
import { caseService } from '../../api/caseService';

export default function ClientFeedback({ userId }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [closedCases, setClosedCases] = useState([]);
  
  // State for the specific case currently being reviewed
  const [reviewingCaseId, setReviewingCaseId] = useState(null);
  
  // Form states
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      // Load feedback history from regular API
      const feedbacks = await feedbackService.getFeedback({ client_id: userId });
      setFeedbackList(feedbacks);

      // Load cases and filter to only show completed ones
      const allCases = await caseService.getCases();
      const completedStatuses = ['closed', 'won', 'lost', 'settled'];
      const completedCases = allCases.filter(c => completedStatuses.includes(c.status));
      setClosedCases(completedCases);
    } catch (e) {
      console.error('Failed to load feedback or cases', e);
      toast.error('Failed to load feedback data');
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video file size must be less than 50MB');
        return;
      }

      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only MP4, MOV, and AVI formats are supported');
        return;
      }

      setVideoFile(file);
      toast.success('Video uploaded successfully');
    }
  };

  const handleSubmitFeedback = async (caseId, lawyerId) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    try {
      await feedbackService.submitFeedback({
        client_id: userId,
        case_id: caseId,
        lawyer_id: lawyerId,
        rating,
        comment,
      }, videoFile);

      toast.success('Feedback submitted successfully!');
      
      // Reset form and reload
      setReviewingCaseId(null);
      setRating(0);
      setComment('');
      setVideoFile(null);
      
      loadData();
    } catch (e) {
      console.error('Failed to submit feedback:', e);
      toast.error('Failed to submit feedback');
    }
  };

  const cancelReview = () => {
    setReviewingCaseId(null);
    setRating(0);
    setComment('');
    setVideoFile(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0A2342] mb-2 font-bold text-2xl">Case Post-Completion Feedback</h1>
        <p className="text-gray-600">Review your finalized cases and let us know about your experience.</p>
      </div>

      {closedCases.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-12">
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No completed cases available</p>
              <p className="text-gray-500">You can only provide feedback once your legal case has fully concluded.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {closedCases.map(c => {
            // Find if feedback exists for this specific case
            const existingFeedback = feedbackList.find(fb => fb.case_id === c.id);
            const isReviewing = reviewingCaseId === c.id;

            return (
              <Card key={c.id} className="border-gray-200 shadow-sm overflow-hidden">
                <div className={`h-2 w-full ${existingFeedback ? 'bg-green-500' : 'bg-yellow-400'}`} />
                
                <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-[#0A2342] text-lg mb-1 flex items-center gap-2">
                         <Briefcase className="w-5 h-5 text-indigo-900" />
                         {c.case_number} - {c.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                         Concluded Legal Case associated with {c.lawyer_name || 'your assigned lawyer'}
                      </CardDescription>
                    </div>
                    {existingFeedback ? (
                      <div className="flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Feedback Submitted
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Pending Review
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {existingFeedback ? (
                    /* Display Existing Feedback specifically for this case */
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-6 h-6 ${
                                star <= existingFeedback.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                          {new Date(existingFeedback.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-gray-700 leading-relaxed text-sm">
                           "{existingFeedback.comment}"
                        </p>
                      </div>

                      {existingFeedback.video_file_name && (
                        <div className="mt-4 flex items-center gap-2 text-[#0A2342] bg-blue-50/50 p-3 rounded-lg border border-blue-100 inline-flex">
                          <Video className="w-5 h-5 shrink-0" />
                          <span className="text-sm font-medium">Video Upload: {existingFeedback.video_file_name}</span>
                        </div>
                      )}
                    </div>
                  ) : isReviewing ? (
                    /* Render the Feedback Form dynamically for this specific case */
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md animate-in slide-in-from-top-4 fade-in duration-300">
                      <h4 className="text-lg font-semibold text-[#0A2342] mb-6">Leave Feedback for {c.case_number}</h4>
                      
                      <div className="space-y-6">
                        <div>
                          <Label className="mb-3 block text-gray-700">Rate Your Experience</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                              >
                                <Star
                                  className={`w-10 h-10 ${
                                    star <= (hoveredRating || rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-200 hover:text-yellow-200'
                                  }`}
                                />
                              </button>
                            ))}
                            {rating > 0 && (
                              <span className="ml-4 text-[#0A2342] font-medium self-center px-3 py-1 bg-blue-50 rounded-full">
                                {rating} out of 5 stars
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`comment-${c.id}`} className="text-gray-700">Your Feedback</Label>
                          <Textarea
                            id={`comment-${c.id}`}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what went well or what could be improved..."
                            className="min-h-[120px] mt-2 border-gray-300 focus:border-[#0A2342] focus:ring-[#0A2342]"
                          />
                        </div>

                        <div>
                          <Label className="text-gray-700">Video Feedback (Optional)</Label>
                          <p className="text-xs text-gray-500 mb-3">
                            Upload a video explaining your experience (MP4, MOV, max 50MB)
                          </p>
                          
                          {!videoFile ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0A2342] transition-colors bg-gray-50 cursor-pointer">
                              <input
                                type="file"
                                accept="video/mp4,video/quicktime,video/x-msvideo"
                                onChange={handleVideoUpload}
                                className="hidden"
                                id={`video-upload-${c.id}`}
                              />
                              <label htmlFor={`video-upload-${c.id}`} className="cursor-pointer block">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                <span className="text-[#0A2342] font-medium block">Click here to upload video</span>
                              </label>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Video className="w-6 h-6 text-[#0A2342]" />
                                <div>
                                  <p className="text-gray-900 text-sm font-medium">{videoFile.name}</p>
                                  <p className="text-gray-500 text-xs">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setVideoFile(null)} className="h-8 w-8 p-0">
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                          <Button variant="outline" onClick={cancelReview}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleSubmitFeedback(c.id, c.lawyer_id)}
                            className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90 shadow-md"
                          >
                            Submit Case Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                     /* No feedback yet, prompt them to review */
                     <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div>
                           <h5 className="font-medium text-gray-900 mb-1">We value your opinion</h5>
                           <p className="text-sm text-gray-600">Your feedback helps us continuously improve our legal services.</p>
                        </div>
                        <Button 
                           onClick={() => setReviewingCaseId(c.id)}
                           className="bg-[#0A2342] text-white mt-4 sm:mt-0 hover:bg-[#0A2342]/90 shadow-md whitespace-nowrap"
                        >
                           Rate & Review Case
                        </Button>
                     </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
