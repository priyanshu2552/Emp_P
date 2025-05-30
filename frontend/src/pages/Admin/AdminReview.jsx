import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WeeklyReviewAdminPage = () => {
  const [reviews, setReviews] = useState([]);
  const [managerFilter, setManagerFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = 'http://localhost:5000/api/admin/weekly-reviews';
      console.log('Making request to:', url);
      
      const response = await axios.get(url, {
        params: { 
          managerId: managerFilter, 
          sort: sortOrder 
        },
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
      });
      
      console.log('Response:', response);
      setReviews(response.data.data);
      setError('');
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      setError(`Failed to fetch reviews: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (userId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/admin/weekly-reviews/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSelectedUser(data.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [managerFilter, sortOrder]);

  return (
   <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
  <div className="bg-white rounded-xl shadow-lg p-8">
    <h2 className="text-3xl font-semibold text-gray-800 mb-6">Weekly Reviews Dashboard</h2>

    {loading && (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4"></div>
      </div>
    )}

    {error && (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
        <p>{error}</p>
      </div>
    )}

    <div className="flex flex-col md:flex-row gap-6 mb-8">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Manager ID</label>
        <input
          type="text"
          placeholder="Enter manager ID"
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>

    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border border-gray-200 rounded-xl bg-white p-6 hover:shadow-xl transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Employee</p>
              <p
                className="text-blue-600 font-medium cursor-pointer hover:underline"
                onClick={() => fetchUser(review.employeeId._id)}
              >
                {review.employeeId.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Manager</p>
              <p
                className="text-blue-600 font-medium cursor-pointer hover:underline"
                onClick={() => fetchUser(review.managerId._id)}
              >
                {review.managerId.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Week</p>
              <p className="font-medium text-gray-800">
                {new Date(review.weekStartDate).toLocaleDateString()} → {new Date(review.weekEndDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center">
                <span className="text-yellow-600 font-semibold mr-2">{review.rating}/5</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(review.rating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Feedback</p>
              <p className="italic text-gray-700">{review.feedback}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Accomplishments</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-800">
              {review.accomplishments.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </div>

  {selectedUser && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={() => setSelectedUser(null)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">User Details</h3>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium mr-1">Name:</span> {selectedUser.name}
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="font-medium mr-1">Email:</span> {selectedUser.email}
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            <span className="font-medium mr-1">Role:</span>
            <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
              selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
              selectedUser.role === 'manager' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {selectedUser.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

  );
};

export default WeeklyReviewAdminPage;