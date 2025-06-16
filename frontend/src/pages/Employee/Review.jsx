import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Input, DatePicker, message, Select, Card, Row, Col, Typography, Space } from 'antd';
import moment from 'moment';
import DashboardLayout from '../../components/Layout/EmployeeLayout';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EmployeeDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/employees/reviews', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReviews(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/employees/reviews', {
        weekStartDate: values.weekRange[0].toISOString(),
        weekEndDate: values.weekRange[1].toISOString(),
        completedTasks: values.tasks.map(task => ({
          task: task.name,
          description: task.description,
          status: task.status
        })),
        challengesFaced: values.challenges,
        lessonsLearned: values.lessons,
        additionalComments: values.comments
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      message.success('Weekly review submitted successfully');
      form.resetFields();
      fetchReviews();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const reviewColumns = [
    { 
      title: 'Week', 
      dataIndex: 'weekStartDate', 
      key: 'weekStart', 
      render: date => moment(date).format('MMM Do'),
      width: 100
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: status => (
        <span style={{
          color: status === 'approved' ? '#52c41a' : 
                status === 'pending' ? '#faad14' : '#f5222d',
          fontWeight: 500
        }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
      width: 100
    },
    { 
      title: 'Feedback', 
      dataIndex: ['managerReview', 'feedback'], 
      key: 'feedback',
      render: feedback => feedback || <Text type="secondary">-</Text>,
      ellipsis: true
    },
    { 
      title: 'Rating', 
      dataIndex: ['managerReview', 'rating'], 
      key: 'rating',
      render: rating => rating ? `${rating}/5` : <Text type="secondary">-</Text>,
      width: 80
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ 
        padding: '16px', 
        height: 'calc(100vh - 64px)', // Subtract header height
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Title level={4} style={{ marginBottom: '16px' }}>Weekly Review Dashboard</Title>
        
        <Row gutter={[16, 16]} style={{ flex: 1, minHeight: 0 }}>
          <Col xs={24} md={12} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card 
              title="Submit Weekly Review"
              bordered={false}
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
              bodyStyle={{ flex: 1, overflow: 'auto', padding: '16px' }}
            >
              <Form form={form} onFinish={onFinish} layout="vertical" style={{ height: '100%' }}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, overflow: 'auto' }}>
                    <Form.Item
                      name="weekRange"
                      label="Week Range"
                      rules={[{ required: true, message: 'Please select the week' }]}
                      style={{ marginBottom: '12px' }}
                    >
                      <DatePicker.RangePicker 
                        style={{ width: '100%' }} 
                        allowClear={false}
                        size="small"
                      />
                    </Form.Item>

                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>Completed Tasks</Text>
                    <Form.List name="tasks">
                      {(fields, { add, remove }) => (
                        <>
                          <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '8px' }}>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space 
                                key={key} 
                                align="baseline" 
                                style={{ 
                                  display: 'flex', 
                                  marginBottom: '8px',
                                  gap: '8px'
                                }}
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, 'name']}
                                  rules={[{ required: true, message: 'Task name required' }]}
                                  style={{ flex: 1, minWidth: '100px' }}
                                >
                                  <Input placeholder="Task" size="small" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'description']}
                                  style={{ flex: 2, minWidth: '120px' }}
                                >
                                  <Input placeholder="Details" size="small" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'status']}
                                  initialValue="completed"
                                  style={{ minWidth: '100px' }}
                                >
                                  <Select size="small">
                                    <Select.Option value="completed">Done</Select.Option>
                                    <Select.Option value="partial">Partial</Select.Option>
                                    <Select.Option value="delayed">Delayed</Select.Option>
                                  </Select>
                                </Form.Item>
                                <Button 
                                  onClick={() => remove(name)} 
                                  size="small" 
                                  danger
                                  type="text"
                                  icon={<span>×</span>}
                                />
                              </Space>
                            ))}
                          </div>
                          <Button 
                            type="dashed" 
                            onClick={() => add()} 
                            block 
                            size="small"
                            style={{ marginBottom: '12px' }}
                          >
                            + Add Task
                          </Button>
                        </>
                      )}
                    </Form.List>

                    <Form.Item 
                      name="challenges" 
                      label="Challenges"
                      style={{ marginBottom: '12px' }}
                    >
                      <TextArea rows={2} size="small" />
                    </Form.Item>

                    <Form.Item 
                      name="lessons" 
                      label="Lessons"
                      style={{ marginBottom: '12px' }}
                    >
                      <TextArea rows={2} size="small" />
                    </Form.Item>

                    <Form.Item 
                      name="comments" 
                      label="Comments"
                      style={{ marginBottom: '12px' }}
                    >
                      <TextArea rows={2} size="small" />
                    </Form.Item>
                  </div>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    style={{ width: '100%' }}
                  >
                    Submit
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          <Col xs={24} md={12} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card 
              title="My Reviews"
              bordered={false}
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
              bodyStyle={{ flex: 1, padding: 0 }}
            >
              <Table 
                dataSource={reviews} 
                columns={reviewColumns} 
                rowKey="_id" 
                loading={loading}
                size="small"
                pagination={{ pageSize: 5, size: 'small' }}
                scroll={{ y: 'calc(100vh - 280px)' }}
                style={{ flex: 1, overflow: 'hidden' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;