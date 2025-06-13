import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Tab, Tabs, Accordion } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiChevronDown, FiChevronUp, FiPlusCircle, FiCalendar, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import DashboardLayout from '../../components/Layout/EmployeeLayout';

const EmployeeLeaveManagement = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState({
    balance: true,
    history: true
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitRequest = async () => {
    try {
      if (!formData.startDate) {
        toast.error('Please select a start date');
        return;
      }

      if (!formData.isHalfDay && !formData.endDate) {
        toast.error('Please select an end date');
        return;
      }

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

  const StatusBadge = ({ status }) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'secondary'
    };
    return <Badge pill bg={variants[status]} style={{ 
      fontSize: '12px',
      padding: '5px 10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>{status.toUpperCase()}</Badge>;
  };

  const LeaveTypeIcon = ({ type }) => {
    const icons = {
      casual: <FiClock style={{ marginRight: '8px' }} />,
      sick: <FiCheckCircle style={{ marginRight: '8px' }} />,
      vacation: <FiCalendar style={{ marginRight: '8px' }} />
    };
    return icons[type] || <FiCalendar style={{ marginRight: '8px' }} />;
  };

  return (
    <DashboardLayout>
      <Container style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        paddingTop: '20px'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{ 
            color: '#2c3e50',
            fontWeight: '600',
            position: 'relative',
            paddingBottom: '10px'
          }}>
            Leave Management
            <span style={{
              content: '',
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '50px',
              height: '3px',
              background: '#3498db'
            }}></span>
          </h1>
          <Button 
            variant="primary" 
            onClick={() => setShowRequestModal(true)}
            style={{
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FiPlusCircle style={{ marginRight: '8px' }} /> New Request
          </Button>
        </div>

        <Row style={{ gap: '16px 0' }}>
          {/* Leave Balance Card */}
          <Col lg={4}>
            <Card style={{ 
              height: '100%',
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <Card.Header style={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #eaeaea',
                padding: '15px 20px'
              }}>
                <h5 style={{ 
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0'
                }}>My Leave Balance</h5>
              </Card.Header>
              <Card.Body>
                {loading.balance ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '15px'
                  }}>
                    <div style={{ 
                      padding: '15px',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease'
                    }}>
                      <h6 style={{ 
                        fontWeight: '600',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <FiClock style={{ marginRight: '8px' }} /> Casual Leave
                      </h6>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ 
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#2c3e50'
                        }}>
                          {leaveBalance?.casualLeaves?.remaining || 12}
                          <small style={{ 
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#7f8c8d'
                          }}>/12</small>
                        </span>
                        <small style={{ color: '#7f8c8d' }}>days remaining</small>
                      </div>
                    </div>

                    <div style={{ 
                      padding: '15px',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease'
                    }}>
                      <h6 style={{ 
                        fontWeight: '600',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <FiCheckCircle style={{ marginRight: '8px' }} /> Sick Leave
                      </h6>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ 
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#2c3e50'
                        }}>
                          {leaveBalance?.sickLeaves?.remaining || 6}
                          <small style={{ 
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#7f8c8d'
                          }}>/6</small>
                        </span>
                        <small style={{ color: '#7f8c8d' }}>days remaining</small>
                      </div>
                    </div>

                    <div style={{ 
                      padding: '15px',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease'
                    }}>
                      <h6 style={{ 
                        fontWeight: '600',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <FiCalendar style={{ marginRight: '8px' }} /> Vacation Leave
                      </h6>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ 
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#2c3e50'
                        }}>
                          {leaveBalance?.vacationLeaves?.remaining || 15}
                          <small style={{ 
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#7f8c8d'
                          }}>/15</small>
                        </span>
                        <small style={{ color: '#7f8c8d' }}>days remaining</small>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Leave History Section */}
          <Col lg={8}>
            <Card style={{ 
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <Card.Header style={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #eaeaea',
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h5 style={{ 
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0'
                }}>My Leave History</h5>
                <Button 
                  variant="link" 
                  onClick={() => setShowHistory(!showHistory)}
                  style={{ 
                    color: '#3498db',
                    textDecoration: 'none',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showHistory ? (
                    <>
                      <FiChevronUp style={{ marginRight: '4px' }} /> Hide History
                    </>
                  ) : (
                    <>
                      <FiChevronDown style={{ marginRight: '4px' }} /> Show History
                    </>
                  )}
                </Button>
              </Card.Header>
              
              {showHistory && (
                <Card.Body>
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                    style={{
                      borderBottom: 'none'
                    }}
                  >
                    <Tab eventKey="all" title="All" style={{
                      border: 'none',
                      color: activeTab === 'all' ? '#3498db' : '#7f8c8d',
                      fontWeight: '500',
                      padding: '10px 15px'
                    }} />
                    <Tab eventKey="pending" title="Pending" style={{
                      border: 'none',
                      color: activeTab === 'pending' ? '#3498db' : '#7f8c8d',
                      fontWeight: '500',
                      padding: '10px 15px'
                    }} />
                    <Tab eventKey="approved" title="Approved" style={{
                      border: 'none',
                      color: activeTab === 'approved' ? '#3498db' : '#7f8c8d',
                      fontWeight: '500',
                      padding: '10px 15px'
                    }} />
                    <Tab eventKey="rejected" title="Rejected" style={{
                      border: 'none',
                      color: activeTab === 'rejected' ? '#3498db' : '#7f8c8d',
                      fontWeight: '500',
                      padding: '10px 15px'
                    }} />
                  </Tabs>

                  {loading.history ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : leaveHistory.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 0',
                      color: '#7f8c8d'
                    }}>
                      <FiCalendar size={48} style={{ marginBottom: '16px', color: 'inherit' }} />
                      <h5 style={{ color: '#2c3e50', marginBottom: '10px' }}>No leave requests found</h5>
                      <p>You haven't applied for any leaves yet</p>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => setShowRequestModal(true)}
                        style={{ marginTop: '10px' }}
                      >
                        Request Leave Now
                      </Button>
                    </div>
                  ) : (
                    <Accordion defaultActiveKey="0">
                      {leaveHistory.map((leave, index) => (
                        <Accordion.Item 
                          key={leave._id} 
                          eventKey={index.toString()} 
                          style={{ 
                            border: '1px solid #eaeaea',
                            borderRadius: '8px',
                            marginBottom: '10px'
                          }}
                        >
                          <Accordion.Header style={{ padding: '15px' }}>
                            <div style={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                              paddingRight: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <LeaveTypeIcon type={leave.leaveType} />
                                <span style={{ 
                                  marginRight: '12px',
                                  fontWeight: '600',
                                  color: '#2c3e50',
                                  minWidth: '80px'
                                }}>
                                  {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
                                </span>
                                <span style={{ color: '#7f8c8d' }}>
                                  {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                  {leave.isHalfDay && ' (Half Day)'}
                                </span>
                              </div>
                              <div>
                                <StatusBadge status={leave.status} />
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body style={{ padding: '10px 0' }}>
                            <div>
                              <p><strong>Reason:</strong> {leave.reason}</p>
                              {leave.reviewerComment && (
                                <p><strong>Manager's Comment:</strong> {leave.reviewerComment}</p>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {leave.status === 'pending' && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleCancelRequest(leave._id)}
                                    style={{ borderRadius: '20px' }}
                                  >
                                    <FiXCircle style={{ marginRight: '4px' }} /> Cancel Request
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  )}
                </Card.Body>
              )}
            </Card>
          </Col>
        </Row>

        {/* Leave Request Modal */}
        <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} centered>
          <Modal.Header closeButton style={{ 
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eaeaea'
          }}>
            <Modal.Title style={{ display: 'flex', alignItems: 'center' }}>
              <FiPlusCircle style={{ marginRight: '8px' }} /> New Leave Request
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row style={{ gap: '12px 0' }}>
                <Col md={12}>
                  <Form.Group controlId="leaveType">
                    <Form.Label>Leave Type</Form.Label>
                    <Form.Select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 15px',
                        border: '1px solid #eaeaea'
                      }}
                    >
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="vacation">Vacation Leave</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group controlId="isHalfDay" style={{ marginBottom: '16px' }}>
                    <Form.Check
                      type="checkbox"
                      label="Half Day Leave"
                      name="isHalfDay"
                      checked={formData.isHalfDay}
                      onChange={handleInputChange}
                      style={{ display: 'flex', alignItems: 'center' }}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="startDate">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 15px',
                        border: '1px solid #eaeaea'
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="endDate">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      disabled={formData.isHalfDay}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 15px',
                        border: '1px solid #eaeaea'
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group controlId="reason">
                    <Form.Label>Reason</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 15px',
                        border: '1px solid #eaeaea'
                      }}
                      placeholder="Briefly explain the reason for your leave..."
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ 
            borderTop: '1px solid #eaeaea'
          }}>
            <Button variant="outline-secondary" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmitRequest}
              style={{
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontWeight: '500'
              }}
            >
              Submit Request
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </DashboardLayout>
  );
};

export default EmployeeLeaveManagement;