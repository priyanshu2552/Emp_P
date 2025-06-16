import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Button, Select, Tag, message, Card, Divider, Rate, List, Space } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, SendOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import ManagerLayout from '../../components/Layout/ManagerLayout';

const { Option } = Select;
const { TextArea } = Input;

const ManagerAppraisalDashboard = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [isSendModalVisible, setIsSendModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/manager',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, appraisalsRes] = await Promise.all([
          api.get('/team'),
          api.get('/appraisals')
        ]);
        setTeamMembers(teamRes.data);
        setAppraisals(appraisalsRes.data);
        setLoading(false);
      } catch (err) {
        message.error('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendAppraisal = async (values) => {
    try {
      const res = await api.post('/appraisals/send', {
        employeeId: selectedEmployee._id,
        period: values.period,
        year: values.year
      });
      setAppraisals([res.data.appraisal, ...appraisals]);
      message.success(res.data.message);
      setIsSendModalVisible(false);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to send appraisal');
    }
  };

  const handleReviewSubmit = async (values) => {
    try {
      const res = await api.put(`/appraisals/${selectedAppraisal._id}/review`, {
        overallRating: values.overallRating,
        feedback: values.feedback,
        acknowledgement: values.acknowledgement,
        actionItems: values.actionItems,
        status: values.status
      });
      
      setAppraisals(appraisals.map(a => 
        a._id === selectedAppraisal._id ? res.data.appraisal : a
      ));
      message.success(res.data.message);
      setIsReviewModalVisible(false);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const statusColors = {
    draft: 'orange',
    'sent-to-employee': 'blue',
    'submitted-by-employee': 'purple',
    'reviewed-by-manager': 'green',
    rejected: 'red'
  };

  const teamColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Employee ID',
      dataIndex: 'EmployeeId',
      key: 'EmployeeId'
    },
    {
      title: 'Department',
      dataIndex: 'Department',
      key: 'Department'
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {record.email}
          </div>
          <div>
            <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {record.contact || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => {
            setSelectedEmployee(record);
            setIsSendModalVisible(true);
          }}
        >
          Send Appraisal
        </Button>
      )
    }
  ];

  const appraisalColumns = [
    {
      title: 'Employee',
      dataIndex: ['employee', 'name'],
      key: 'employee'
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => `${record.period} ${record.year}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={statusColors[status]}>
          {status.replace(/-/g, ' ')}
        </Tag>
      )
    },
    {
      title: 'Submitted',
      key: 'submitted',
      render: (_, record) => (
        record.employeeSubmission?.submittedAt ? 
          new Date(record.employeeSubmission.submittedAt).toLocaleDateString() : 
          'Not submitted'
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            onClick={() => {
              setSelectedAppraisal(record);
              setIsDetailsModalVisible(true);
            }}
          >
            View Details
          </Button>
          {record.status === 'submitted-by-employee' && (
            <Button
              type="primary"
              onClick={() => {
                setSelectedAppraisal(record);
                reviewForm.setFieldsValue({
                  overallRating: record.managerReview?.overallRating || 3,
                  feedback: record.managerReview?.feedback || '',
                  acknowledgement: record.managerReview?.acknowledgement || false,
                  actionItems: record.managerReview?.actionItems || [],
                  status: 'reviewed-by-manager'
                });
                setIsReviewModalVisible(true);
              }}
            >
              Review
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Common modal styles
  const modalStyles = {
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1001
  };

  const modalBodyStyles = {
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: '24px'
  };

  return (
    <ManagerLayout>
      <div style={{ padding: 24, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 8, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: 24
        }}>
          <h1 style={{ marginBottom: 24, color: '#1890ff' }}>Manager Appraisal Dashboard</h1>
          
          <Card 
            title="My Team Members" 
            style={{ marginBottom: 24 }}
            loading={loading}
          >
            <Table 
              columns={teamColumns} 
              dataSource={teamMembers} 
              rowKey="_id"
              pagination={false}
            />
          </Card>

          <Card 
            title="Team Appraisals" 
            loading={loading}
          >
            <Table 
              columns={appraisalColumns} 
              dataSource={appraisals} 
              rowKey="_id"
            />
          </Card>
        </div>

        {/* Send Appraisal Modal */}
        <Modal
          title={`Send Appraisal to ${selectedEmployee?.name || ''}`}
          visible={isSendModalVisible}
          onCancel={() => setIsSendModalVisible(false)}
          footer={null}
          width={600}
          style={modalStyles}
          bodyStyle={modalBodyStyles}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendAppraisal}
            initialValues={{ year: new Date().getFullYear() }}
          >
            <Form.Item
              label="Period"
              name="period"
              rules={[{ required: true, message: 'Please select period' }]}
            >
              <Select placeholder="Select period">
                <Option value="Q1">Q1</Option>
                <Option value="Q2">Q2</Option>
                <Option value="Q3">Q3</Option>
                <Option value="Q4">Q4</Option>
                <Option value="Annual">Annual</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Year"
              name="year"
              rules={[{ required: true, message: 'Please enter year' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Send Appraisal
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Review Appraisal Modal */}
        <Modal
          title={`Review Appraisal for ${selectedAppraisal?.employee?.name || ''}`}
          visible={isReviewModalVisible}
          onCancel={() => setIsReviewModalVisible(false)}
          footer={null}
          width={800}
          style={modalStyles}
          bodyStyle={modalBodyStyles}
        >
          <Form
            form={reviewForm}
            layout="vertical"
            onFinish={handleReviewSubmit}
          >
            <div style={{ marginBottom: 24 }}>
              <h3>Employee Self-Rating: {selectedAppraisal?.employeeSubmission?.selfRating || 'Not submitted'}</h3>
              <h3>Employee Comments: {selectedAppraisal?.employeeSubmission?.finalComments || 'None'}</h3>
            </div>

            <Form.Item
              label="Overall Rating"
              name="overallRating"
              rules={[{ required: true, message: 'Please provide rating' }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item
              label="Feedback"
              name="feedback"
              rules={[{ required: true, message: 'Please provide feedback' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="Action Items"
              name="actionItems"
            >
              <Select mode="tags" placeholder="Add action items" />
            </Form.Item>

            <Form.Item
              label="Acknowledgement"
              name="acknowledgement"
              valuePropName="checked"
            >
              <Input type="checkbox" />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="reviewed-by-manager">Approve</Option>
                <Option value="rejected">Reject</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Submit Review
                </Button>
                <Button onClick={() => setIsReviewModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Appraisal Details Modal */}
        <Modal
          title={`Appraisal Details - ${selectedAppraisal?.employee?.name || ''}`}
          visible={isDetailsModalVisible}
          onCancel={() => setIsDetailsModalVisible(false)}
          footer={null}
          width={1000}
          style={modalStyles}
          bodyStyle={modalBodyStyles}
        >
          {selectedAppraisal && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2>Basic Information</h2>
                <p><strong>Period:</strong> {selectedAppraisal.period} {selectedAppraisal.year}</p>
                <p><strong>Status:</strong> 
                  <Tag 
                    color={statusColors[selectedAppraisal.status]}
                    style={{ marginLeft: 8 }}
                  >
                    {selectedAppraisal.status.replace(/-/g, ' ')}
                  </Tag>
                </p>
                <p><strong>Created:</strong> {new Date(selectedAppraisal.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(selectedAppraisal.updatedAt).toLocaleDateString()}</p>
              </div>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <h2>Employee Details</h2>
                <div style={{ display: 'flex', marginBottom: 8 }}>
                  <IdcardOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span><strong>ID:</strong> {selectedAppraisal.employee?.EmployeeId}</span>
                </div>
                <div style={{ display: 'flex', marginBottom: 8 }}>
                  <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span><strong>Name:</strong> {selectedAppraisal.employee?.name}</span>
                </div>
                <div style={{ display: 'flex', marginBottom: 8 }}>
                  <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span><strong>Email:</strong> {selectedAppraisal.employee?.email}</span>
                </div>
                <div style={{ display: 'flex' }}>
                  <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span><strong>Contact:</strong> {selectedAppraisal.employee?.contact || 'N/A'}</span>
                </div>
              </div>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <h2>Work Items</h2>
                {selectedAppraisal.workItems?.length > 0 ? (
                  <List
                    dataSource={selectedAppraisal.workItems}
                    renderItem={(item, index) => (
                      <List.Item key={index} style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
                        <div style={{ width: '100%' }}>
                          <p><strong>Description:</strong> {item.description}</p>
                          <p><strong>Status:</strong> {item.completionStatus}</p>
                          <p><strong>Code Quality:</strong> <Rate disabled defaultValue={item.codeQualityRating} /></p>
                          <p><strong>Delivered on time:</strong> {item.timelyDelivery ? 'Yes' : 'No'}</p>
                          {item.technologiesUsed?.length > 0 && (
                            <p><strong>Technologies:</strong> {item.technologiesUsed.join(', ')}</p>
                          )}
                          {item.challenges && <p><strong>Challenges:</strong> {item.challenges}</p>}
                          {item.solutions && <p><strong>Solutions:</strong> {item.solutions}</p>}
                          {item.learnings && <p><strong>Learnings:</strong> {item.learnings}</p>}
                        </div>
                      </List.Item>
                    )}
                  />
                ) : <p>No work items recorded</p>}
              </div>

              {selectedAppraisal.employeeSubmission && (
                <>
                  <Divider />
                  <div style={{ marginBottom: 24 }}>
                    <h2>Employee Submission</h2>
                    <p><strong>Self Rating:</strong> <Rate disabled value={selectedAppraisal.employeeSubmission.selfRating} /></p>
                    <p><strong>Comments:</strong> {selectedAppraisal.employeeSubmission.finalComments}</p>
                    <p><strong>Submitted At:</strong> {new Date(selectedAppraisal.employeeSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                </>
              )}

              {selectedAppraisal.managerReview && (
                <>
                  <Divider />
                  <div>
                    <h2>Manager Review</h2>
                    <p><strong>Overall Rating:</strong> <Rate disabled value={selectedAppraisal.managerReview.overallRating} /></p>
                    <p><strong>Feedback:</strong> {selectedAppraisal.managerReview.feedback}</p>
                    <p><strong>Acknowledgement:</strong> {selectedAppraisal.managerReview.acknowledgement ? 'Yes' : 'No'}</p>
                    {selectedAppraisal.managerReview.actionItems?.length > 0 && (
                      <div>
                        <strong>Action Items:</strong>
                        <ul style={{ marginTop: 8 }}>
                          {selectedAppraisal.managerReview.actionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p><strong>Reviewed At:</strong> {new Date(selectedAppraisal.managerReview.reviewedAt).toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </ManagerLayout>
  );
};

export default ManagerAppraisalDashboard;