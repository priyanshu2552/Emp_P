import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Input, DatePicker, message ,Select} from 'antd';
import moment from 'moment';
import DashboardLayout from '../../components/Layout/EmployeeLayout';
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
    { title: 'Week Start', dataIndex: 'weekStartDate', key: 'weekStart', 
      render: date => moment(date).format('MMM Do YYYY') },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Feedback', dataIndex: ['managerReview', 'feedback'], key: 'feedback' },
    { title: 'Rating', dataIndex: ['managerReview', 'rating'], key: 'rating' }
  ];

  return (
    <DashboardLayout>
    <div>
      <h1>Employee Dashboard</h1>
      
      <div style={{ marginBottom: 24 }}>
        <h2>Submit Weekly Review</h2>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="weekRange"
            label="Week Range"
            rules={[{ required: true, message: 'Please select the week' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.List name="tasks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: 'Missing task name' }]}
                      style={{ flex: 1, marginRight: 8 }}
                    >
                      <Input placeholder="Task name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      style={{ flex: 2, marginRight: 8 }}
                    >
                      <Input placeholder="Description" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'status']}
                      initialValue="completed"
                    >
                      <Select style={{ width: 120 }}>
                        <Select.Option value="completed">Completed</Select.Option>
                        <Select.Option value="partial">Partial</Select.Option>
                        <Select.Option value="delayed">Delayed</Select.Option>
                      </Select>
                    </Form.Item>
                    <Button onClick={() => remove(name)}>Remove</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Add Task
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item name="challenges" label="Challenges Faced">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="lessons" label="Lessons Learned">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="comments" label="Additional Comments">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Submit Review
          </Button>
        </Form>
      </div>

      <h2>My Reviews</h2>
      <Table 
        dataSource={reviews} 
        columns={reviewColumns} 
        rowKey="_id" 
        loading={loading}
      />
    </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;