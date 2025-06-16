import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Row, Col, Statistic } from 'antd';

const AdminDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: [5, 10, 15, 20],
    total: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [reviewsRes, usersRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/reviews', config),
          axios.get('http://localhost:5000/api/admin/users', config),
          axios.get('http://localhost:5000/api/admin/overview', config)
        ]);

        setReviews(reviewsRes.data);
        setUsers(usersRes.data);
        setStats(statsRes.data);
        setLoading(false);
        setPagination({
          ...pagination,
          total: reviewsRes.data.length // Set total number of items
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const reviewColumns = [
    { title: 'Employee', dataIndex: ['employee', 'name'], key: 'employee' },
    { title: 'Week Start', dataIndex: 'weekStartDate', key: 'weekStart' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Rating', dataIndex: ['managerReview', 'rating'], key: 'rating' }
  ];

  return (
    <div style={{
      padding: '24px',
      maxHeight: '100vh',
      overflow: 'auto'
    }}>
      <h1 style={{ marginBottom: '24px' }}>Admin Dashboard</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Employees" value={stats.totalEmployees} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Managers" value={stats.totalManagers} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Pending Reviews" value={stats.pendingReviews} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Reviewed" value={stats.reviewedReviews} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: '24px' }}>
        <h2>Weekly Reviews</h2>
        <Table
          dataSource={reviews}
          columns={reviewColumns}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;