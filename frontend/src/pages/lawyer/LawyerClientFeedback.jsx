import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Star, Video, User, Briefcase } from 'lucide-react';
import { feedbackService } from '../../api/feedbackService';
import { toast } from 'sonner@2.0.3';

export default function LawyerClientFeedback({ lawyerId }) {
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    if (lawyerId) {
      loadFeedback();
    }
  }, [lawyerId]);

  const loadFeedback = async () => {
    try {
      const data = await feedbackService.getFeedback({ lawyer_id: lawyerId });
      setFeedbackList(data);
    } catch (e) {
      console.error('Failed to load feedback', e);
      toast.error('Failed to load client feedback');
    }
  };

  const averageRating =
    feedbackList.length > 0
      ? (feedbackList.reduce((sum, fb) => sum + fb.rating, 0) / feedbackList.length).toFixed(1)
      : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: feedbackList.filter((fb) => fb.rating === rating).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0A2342] mb-2">Client Feedback</h1>
        <p className="text-gray-600">View feedback and ratings from your clients</p>
      </div>

      {/* Overall Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#0A2342]">Overall Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-[#0A2342] text-4xl font-bold mb-4">{averageRating}</div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${star <= Math.round(parseFloat(averageRating))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">Based on {feedbackList.length} reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#0A2342]">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-8 text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${feedbackList.length > 0 ? (count / feedbackList.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Client Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbackList.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                              className={`w-4 h-4 ${star <= feedback.rating
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
                       <div className="flex items-center gap-1.5 text-xs font-medium text-[#0A2342] bg-blue-50 px-2 py-1 rounded">
                         <Briefcase className="w-3.5 h-3.5" />
                         {feedback.case_number ? `${feedback.case_number} - ${feedback.case_title}` : 'Case Unknown'}
                       </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 mt-2">{feedback.comment}</p>

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
