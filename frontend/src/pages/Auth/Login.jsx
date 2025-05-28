import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        role
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate based on role
      if (user.role === 'employee') navigate('/employee-dashboard');
      else if (user.role === 'manager') navigate('/manager-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');

    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={styles.button}>Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '300px',
    margin: '50px auto',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    borderRadius: '8px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    margin: '10px 0',
    padding: '10px',
    fontSize: '16px'
  },
  button: {
    backgroundColor: '#f4c430',
    padding: '10px',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px'
  }
};

export default Login;
