import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Tab, Tabs } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const EmployeeLeaveManagement = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState({
    balance: true,
    history: true
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual',
    reason: '',
    isHalfDay: false
  });
  const API_BASE_URL = 'http://localhost:5000/api';
  // Fetch leave balance
  const fetchLeaveBalance = async () => {
  try {
    setLoading(prev => ({ ...prev, balance: true }));
    const { data } = await axios.get(`${API_BASE_URL}/employees/leave/balance`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    setLeaveBalance(data.data);
  } catch (error) {
    toast.error('Failed to fetch leave balance');
  } finally {
    setLoading(prev => ({ ...prev, balance: false }));
  }
};

// Fetch leave history
const fetchLeaveHistory = async () => {
  try {
    setLoading(prev => ({ ...prev, history: true }));
    const { data } = await axios.get(`${API_BASE_URL}/employees/leave/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      params: { 
        status: activeTab === 'all' ? undefined : activeTab 
      }
    });
    setLeaveHistory(data.data);
  } catch (error) {
    toast.error('Failed to fetch leave history');
  } finally {
    setLoading(prev => ({ ...prev, history: false }));
  }
};

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveHistory();
  }, [activeTab]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Submit leave request
  const handleSubmitRequest = async () => {
  try {
    // Validate dates
    if (!formData.startDate) {
      toast.error('Please select a start date');
      return;
    }

    if (!formData.isHalfDay && !formData.endDate) {
      toast.error('Please select an end date');
      return;
    }

    // Prepare request data
    const requestData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.isHalfDay 
        ? new Date(formData.startDate).toISOString()
        : new Date(formData.endDate).toISOString()
    };

    const response = await axios.post(
      `${API_BASE_URL}/employees/leave/request`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    toast.success('Leave request submitted successfully');
    setShowRequestModal(false);
    fetchLeaveBalance();
    fetchLeaveHistory();
  } catch (error) {
    console.error('Error details:', error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to submit leave request');
  }
};
  // Cancel leave request
  const handleCancelRequest = async (id) => {
  try {
    await axios.put(
      `${API_BASE_URL}/employees/leave/request/${id}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    toast.success('Leave request cancelled');
    fetchLeaveHistory();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to cancel leave request');
  }
};

  // Status badge component
  const StatusBadge = ({ status }) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'secondary'
    };
    return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">My Leave Management</h1>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Leave Balance</h5>
            </Card.Header>
            <Card.Body>
              {loading.balance ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : leaveBalance ? (
                <>
                  <div className="mb-3">
                    <h6>Casual Leave</h6>
                    <p>Total: {leaveBalance.casualLeaves?.total || 12} days</p>
                    <p>Remaining: {leaveBalance.casualLeaves?.remaining || 12} days</p>
                  </div>
                  <div className="mb-3">
                    <h6>Sick Leave</h6>
                    <p>Total: {leaveBalance.sickLeaves?.total || 6} days</p>
                    <p>Remaining: {leaveBalance.sickLeaves?.remaining || 6} days</p>
                  </div>
                  <div>
                    <h6>Vacation Leave</h6>
                    <p>Total: {leaveBalance.vacationLeaves?.total || 15} days</p>
                    <p>Remaining: {leaveBalance.vacationLeaves?.remaining || 15} days</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <h6>Casual Leave</h6>
                    <p>Total: 12 days</p>
                    <p>Remaining: 12 days</p>
                  </div>
                  <div className="mb-3">
                    <h6>Sick Leave</h6>
                    <p>Total: 6 days</p>
                    <p>Remaining: 6 days</p>
                  </div>
                  <div>
                    <h6>Vacation Leave</h6>
                    <p>Total: 15 days</p>
                    <p>Remaining: 15 days</p>
                  </div>
                </>
              )}
            </Card.Body>
            <Card.Footer>
              <Button variant="primary" onClick={() => setShowRequestModal(true)}>
                Request Leave
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Leave History</h5>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="all" title="All" />
                <Tab eventKey="pending" title="Pending" />
                <Tab eventKey="approved" title="Approved" />
                <Tab eventKey="rejected" title="Rejected" />
              </Tabs>

              {loading.history ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : leaveHistory.length === 0 ? (
                <p>No leave requests found</p>
              ) : (
                leaveHistory.map((leave) => (
                  <Card key={leave._id} className={`mb-3 border-start border-5 ${leave.status}`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6>{leave.leaveType.toUpperCase()}</h6>
                          <p className="mb-1">
                            {format(new Date(leave.startDate), 'MMM dd, yyyy')} to {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                            {leave.isHalfDay && ' (Half Day)'}
                          </p>
                          <p className="mb-1"><small>Reason: {leave.reason}</small></p>
                          {leave.reviewerComment && (
                            <p className="mb-1"><small>Comment: {leave.reviewerComment}</small></p>
                          )}
                        </div>
                        <div className="text-end">
                          <StatusBadge status={leave.status} />
                          {leave.status === 'pending' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleCancelRequest(leave._id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Leave Request Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Leave Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Leave Type</Form.Label>
                  <Form.Select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="vacation">Vacation Leave</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3 form-check">
                  <Form.Check
                    type="checkbox"
                    label="Half Day"
                    name="isHalfDay"
                    checked={formData.isHalfDay}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    disabled={formData.isHalfDay}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitRequest}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeLeaveManagement;