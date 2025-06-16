import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Form, 
  Input, 
  Rate, 
  message, 
  Card, 
  List,
  Row,
  Col,
  Select  // Make sure this is included in the import
} from 'antd';
import moment from 'moment';
import ManagerLayout from '../../components/Layout/ManagerLayout';
const ManagerDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReviewId, setActiveReviewId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [reviewsRes, teamRes] = await Promise.all([
        axios.get('http://localhost:5000/api/manager/reviews', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        axios.get('http://localhost:5000/api/manager/team', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      setReviews(reviewsRes.data);
      setTeam(teamRes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch data');
    }
  };

  const onFinish = async (values, reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/manager/reviews/${reviewId}`, {
        feedback: values.feedback,
        rating: values.rating,
        nextWeekPlan: values.nextWeekPlan
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      message.success('Review submitted successfully');
      fetchData();
      setActiveReviewId(null);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const reviewColumns = [
    { title: 'Employee', dataIndex: ['employee', 'name'], key: 'employee' },
    { 
      title: 'Week', 
      key: 'week', 
      render: (_, record) => (
        `${moment(record.weekStartDate).format('MMM Do')} - ${moment(record.weekEndDate).format('MMM Do')}`
      )
    },
    { 
      title: 'Tasks Completed', 
      key: 'tasks', 
      render: (_, record) => record.employeeSubmission.completedTasks.length 
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => {
            setActiveReviewId(record._id);
            const element = document.getElementById(`review-form-${record._id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {record._id === activeReviewId ? 'Editing...' : 'Review'}
        </Button>
      )
    }
  ];

  return (
    <ManagerLayout>
    <div>
      <h1>Manager Dashboard</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Team Members">
            <List
              dataSource={team}
              renderItem={member => (
                <List.Item>
                  <List.Item.Meta
                    title={member.name}
                    description={`${member.Department} • ${member.EmployeeId}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Reviews to Complete">
            <Table
              dataSource={reviews}
              columns={reviewColumns}
              rowKey="_id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {reviews.map(review => (
        <div key={review._id} id={`review-form-${review._id}`} style={{ marginBottom: 24 }}>
          <Card 
            title={`Review for ${review.employee.name} (${moment(review.weekStartDate).format('MMM Do')} - ${moment(review.weekEndDate).format('MMM Do')}`}
            extra={
              <Button 
                type="link" 
                onClick={() => setActiveReviewId(activeReviewId === review._id ? null : review._id)}
              >
                {activeReviewId === review._id ? 'Collapse' : 'Expand'}
              </Button>
            }
          >
            <h3>Employee Submission</h3>
            <p><strong>Completed Tasks:</strong></p>
            <ul>
              {review.employeeSubmission.completedTasks.map((task, i) => (
                <li key={i}>
                  {task.task} - {task.description} ({task.status})
                </li>
              ))}
            </ul>
            <p><strong>Challenges:</strong> {review.employeeSubmission.challengesFaced}</p>
            <p><strong>Lessons Learned:</strong> {review.employeeSubmission.lessonsLearned}</p>

            {(activeReviewId === review._id) && (
              <>
                <h3>Manager Review</h3>
                <Form
                  layout="vertical"
                  initialValues={{
                    feedback: review.managerReview?.feedback || '',
                    rating: review.managerReview?.rating || 3,
                    nextWeekPlan: review.managerReview?.nextWeekPlan || []
                  }}
                  onFinish={(values) => onFinish(values, review._id)}
                >
                  <Form.Item name="feedback" label="Feedback">
                    <Input.TextArea rows={4} />
                  </Form.Item>

                  <Form.Item name="rating" label="Rating">
                    <Rate />
                  </Form.Item>

                  <Form.List name="nextWeekPlan">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                            <Form.Item
                              {...restField}
                              name={[name, 'task']}
                              rules={[{ required: true, message: 'Missing task' }]}
                              style={{ flex: 2, marginRight: 8 }}
                            >
                              <Input placeholder="Task" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'priority']}
                              initialValue="medium"
                              style={{ flex: 1, marginRight: 8 }}
                            >
                              <Select>
                                <Select.Option value="high">High</Select.Option>
                                <Select.Option value="medium">Medium</Select.Option>
                                <Select.Option value="low">Low</Select.Option>
                              </Select>
                            </Form.Item>
                            <Button onClick={() => remove(name)}>Remove</Button>
                          </div>
                        ))}
                        <Button type="dashed" onClick={() => add()} block>
                          Add Task for Next Week
                        </Button>
                      </>
                    )}
                  </Form.List>

                  <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
                    Submit Review
                  </Button>
                </Form>
              </>
            )}
          </Card>
        </div>
      ))}
    </div>
    </ManagerLayout>
  );
};

export default ManagerDashboard;