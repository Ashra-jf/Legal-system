import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Star, Video, User, MessageSquare, Briefcase } from 'lucide-react';
import { feedbackService } from '../../api/feedbackService';
import { toast } from 'sonner@2.0.3';

export default function AdminFeedbackReview() {
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await feedbackService.getFeedback();
      setFeedbackList(data);
    } catch (e) {
      console.error('Failed to load all feedback', e);
      toast.error('Failed to load system feedback');
    }
  };

  const averageRating =
    feedbackList.length > 0
      ? (feedbackList.reduce((sum, fb) => sum + fb.rating, 0) / feedbackList.length).toFixed(1)
      : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: feedbackList.filter((fb) => fb.rating === rating).length,
    percentage: feedbackList.length > 0 
      ? ((feedbackList.filter((fb) => fb.rating === rating).length / feedbackList.length) * 100).toFixed(0)
      : '0',
  }));

  const videoFeedbackCount = feedbackList.filter(fb => fb.video_file_name).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0A2342] mb-2">Feedback Review</h1>
        <p className="text-gray-600">Monitor and analyze client feedback across all services</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Feedback</p>
                <p className="text-[#0A2342] text-2xl font-semibold">{feedbackList.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Average Rating</p>
                <p className="text-[#0A2342] text-2xl font-semibold">{averageRating} / 5.0</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Video Feedback</p>
                <p className="text-[#0A2342] text-2xl font-semibold">{videoFeedbackCount}</p>
              </div>
              <Video className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Satisfaction Rate</p>
                <p className="text-green-600 text-2xl font-semibold">
                  {feedbackList.length > 0 
                    ? ((feedbackList.filter(fb => fb.rating >= 4).length / feedbackList.length) * 100).toFixed(0)
                    : '0'}%
                </p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <span className="w-12 text-gray-700 font-medium">{rating} Star{rating !== 1 && 's'}</span>
                <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0A2342] flex items-center justify-end pr-3 text-white text-sm transition-all"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage}%
                  </div>
                </div>
                <span className="w-12 text-right text-gray-600 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Feedback */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">All Client Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbackList.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No feedback received yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E5F1FB] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#0A2342]" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{feedback.client_name || 'Client'}</p>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= feedback.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-gray-500 text-sm">{new Date(feedback.created_at).toLocaleDateString()}</span>
                       <div className="flex flex-col items-end gap-1.5 mt-1">
                         <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                           <User className="w-3.5 h-3.5" />
                           For: {feedback.lawyer_name || 'Assigned Lawyer'}
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-medium text-[#0A2342] bg-blue-50 px-2 py-1 rounded border border-blue-100">
                           <Briefcase className="w-3.5 h-3.5" />
                           {feedback.case_number ? `${feedback.case_number} - ${feedback.case_title}` : 'Case Unknown'}
                         </div>
                       </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 ml-1">{feedback.comment}</p>

                  {feedback.video_file_name && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-5 h-5 text-[#0A2342]" />
                        <h5 className="text-[#0A2342] text-sm font-semibold">Video Feedback Attached</h5>
                      </div>
                      <video 
                        className="w-full max-w-lg rounded-md border border-gray-200 mt-2" 
                        controls 
                        preload="metadata"
                      >
                        <source src={`http://localhost:5000/uploads/${feedback.video_file_name}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
