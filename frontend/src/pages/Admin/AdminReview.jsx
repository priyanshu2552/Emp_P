import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Row, Col, Statistic } from 'antd';

const AdminDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const reviewColumns = [
    { title: 'Employee', dataIndex: ['employee', 'name'], key: 'employee' },
    { title: 'Week Start', dataIndex: 'weekStartDate', key: 'weekStart' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Rating', dataIndex: ['managerReview', 'rating'], key: 'rating' }
  ];

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Department', dataIndex: 'Department', key: 'department' }
  ];

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Employees" value={stats.totalEmployees} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Managers" value={stats.totalManagers} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Pending Reviews" value={stats.pendingReviews} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Reviewed" value={stats.reviewedReviews} />
          </Card>
        </Col>
      </Row>

      <h2>Weekly Reviews</h2>
      <Table 
        dataSource={reviews} 
        columns={reviewColumns} 
        rowKey="_id" 
        loading={loading}
      />

      <h2>Users</h2>
      <Table 
        dataSource={users} 
        columns={userColumns} 
        rowKey="_id" 
        loading={loading}
      />
    </div>
  );
};

export default AdminDashboard;