import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Table } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';

const AdminLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState(null);
  const [filter, setFilter] = useState({ status: '' });
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [processData, setProcessData] = useState({ status: 'approved', comment: '' });
  const [resetting, setResetting] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Axios instance with base URL and auth header
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/admin', // Remove the extra '/api/admin'
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Fetch all leave requests
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/leaves', { params: filter });
      setLeaves(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave policy
  const fetchPolicy = async () => {
    try {
      const { data } = await api.get('/policy');
      setPolicy(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch leave policy');
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchPolicy();
  }, [filter]);

  // Handle leave processing
  const handleProcessLeave = async () => {
    try {
     

      const response = await api.put(`/leaves/${selectedLeave._id}/process`, {
        status: processData.status,
        comment: processData.comment || undefined // Send undefined if no comment
      });

      if (response.data.success) {
        toast.success('Leave request processed successfully');
        fetchLeaves();
        setShowProcessModal(false);
      } else {
        toast.error(response.data.message || 'Failed to process leave request');
      }
    } catch (error) {
      console.error('Error processing leave:', error);

      // More detailed error message
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to process leave request';

      toast.error(errorMessage);
    } 
  };

  // Update leave policy
  const handleUpdatePolicy = async () => {
    try {
      const { data } = await api.put('/policy', policy);
      setPolicy(data.data);
      toast.success('Leave policy updated successfully');
      setShowPolicyModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave policy');
    }
  };

  // Reset yearly allocations
  const handleResetAllocations = async () => {
    try {
      setResetting(true);
      await api.post('/reset-allocations');
      toast.success('Yearly allocations reset successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset allocations');
    } finally {
      setResetting(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  // Format date
  const formatDate = (date) => {
    return format(parseISO(new Date(date).toISOString()), 'MMM dd, yyyy');
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Admin Leave Management</h1>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Leave Requests</h5>
              <Form.Select
                style={{ width: '200px' }}
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : leaves.length === 0 ? (
                <p>No leave requests found</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>{leave.user?.name || 'Unknown User'}</td>
                        <td>{leave.leaveType.toUpperCase()}</td>
                        <td>
                          {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                          {leave.isHalfDay && ' (Half Day)'}
                        </td>
                        <td>{leave.isHalfDay ? '0.5 day' : `${Math.floor((new Date(leave.endDate) - new Date(leave.startDate)) / ((1000 * 60 * 60 * 24) + 1))} days`}</td>
                        <td><StatusBadge status={leave.status} /></td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowProcessModal(true);
                            }}
                            disabled={leave.status !== 'pending'}
                          >
                            Process
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Leave Policy</h5>
            </Card.Header>
            <Card.Body>
              {policy ? (
                <>
                  <h6>{policy.policyName} ({policy.year || new Date().getFullYear()})</h6>
                  <div className="mt-3">
                    <h6>Casual Leave</h6>
                    <p>Entitlement: {policy.casualLeave?.entitlement || 12} days</p>
                    <p>Carry Over: {policy.casualLeave?.canCarryOver ? 'Yes' : 'No'}</p>

                    <h6 className="mt-3">Sick Leave</h6>
                    <p>Entitlement: {policy.sickLeave?.entitlement || 6} days</p>
                    <p>Requires Documentation: {policy.sickLeave?.requiresDocumentation ? 'Yes' : 'No'}</p>

                    <h6 className="mt-3">Vacation Leave</h6>
                    <p>Entitlement: {policy.vacationLeave?.entitlement || 15} days</p>
                    <p>Min Notice: {policy.vacationLeave?.minNoticePeriod || 7} days</p>
                  </div>
                </>
              ) : (
                <Spinner animation="border" />
              )}
            </Card.Body>
            <Card.Footer>
              <Button variant="primary" size="sm" onClick={() => setShowPolicyModal(true)}>
                Edit Policy
              </Button>
              <Button
                variant="warning"
                size="sm"
                className="ms-2"
                onClick={handleResetAllocations}
                disabled={resetting}
              >
                {resetting ? <Spinner size="sm" /> : 'Reset Allocations'}
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Policy Modal */}
      <Modal show={showPolicyModal} onHide={() => setShowPolicyModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Leave Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {policy ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Policy Name</Form.Label>
                <Form.Control
                  type="text"
                  value={policy.policyName}
                  onChange={(e) => setPolicy({ ...policy, policyName: e.target.value })}
                />
              </Form.Group>

              <h5>Casual Leave</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entitlement (days)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={policy.casualLeave?.entitlement || 12}
                      onChange={(e) => setPolicy({
                        ...policy,
                        casualLeave: {
                          ...policy.casualLeave,
                          entitlement: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Can Carry Over"
                      checked={policy.casualLeave?.canCarryOver || false}
                      onChange={(e) => setPolicy({
                        ...policy,
                        casualLeave: {
                          ...policy.casualLeave,
                          canCarryOver: e.target.checked
                        }
                      })}
                    />
                  </Form.Group>
                  {policy.casualLeave?.canCarryOver && (
                    <Form.Group className="mb-3">
                      <Form.Label>Carry Over Limit (days)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={policy.casualLeave?.carryOverLimit || 0}
                        onChange={(e) => setPolicy({
                          ...policy,
                          casualLeave: {
                            ...policy.casualLeave,
                            carryOverLimit: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </Form.Group>
                  )}
                </Col>
              </Row>

              <h5 className="mt-4">Sick Leave</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entitlement (days)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={policy.sickLeave?.entitlement || 6}
                      onChange={(e) => setPolicy({
                        ...policy,
                        sickLeave: {
                          ...policy.sickLeave,
                          entitlement: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Requires Documentation"
                      checked={policy.sickLeave?.requiresDocumentation || false}
                      onChange={(e) => setPolicy({
                        ...policy,
                        sickLeave: {
                          ...policy.sickLeave,
                          requiresDocumentation: e.target.checked
                        }
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4">Vacation Leave</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entitlement (days)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={policy.vacationLeave?.entitlement || 15}
                      onChange={(e) => setPolicy({
                        ...policy,
                        vacationLeave: {
                          ...policy.vacationLeave,
                          entitlement: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Can Carry Over"
                      checked={policy.vacationLeave?.canCarryOver || true}
                      onChange={(e) => setPolicy({
                        ...policy,
                        vacationLeave: {
                          ...policy.vacationLeave,
                          canCarryOver: e.target.checked
                        }
                      })}
                    />
                  </Form.Group>
                  {policy.vacationLeave?.canCarryOver && (
                    <Form.Group className="mb-3">
                      <Form.Label>Carry Over Limit (days)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={policy.vacationLeave?.carryOverLimit || 5}
                        onChange={(e) => setPolicy({
                          ...policy,
                          vacationLeave: {
                            ...policy.vacationLeave,
                            carryOverLimit: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </Form.Group>
                  )}
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Notice Period (days)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={policy.vacationLeave?.minNoticePeriod || 7}
                      onChange={(e) => setPolicy({
                        ...policy,
                        vacationLeave: {
                          ...policy.vacationLeave,
                          minNoticePeriod: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPolicyModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdatePolicy}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Process Leave Modal */}
      <Modal show={showProcessModal} onHide={() => setShowProcessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Process Leave Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave && (
            <>
              <p><strong>Employee:</strong> {selectedLeave.user?.name}</p>
              <p><strong>Leave Type:</strong> {selectedLeave.leaveType.toUpperCase()}</p>
              <p><strong>Dates:</strong> {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Action</Form.Label>
                  <Form.Select
                    value={processData.status}
                    onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={processData.comment}
                    onChange={(e) => setProcessData({ ...processData, comment: e.target.value })}
                    placeholder="Enter comments for the employee (optional)"
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProcessModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleProcessLeave}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminLeaveManagement;