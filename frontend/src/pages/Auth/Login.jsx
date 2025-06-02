import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      }

      if (user.role === 'employee') navigate('/employee/dashboard');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const glassStyle = {
    backdropFilter: 'blur(15px)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    borderRadius: '16px',
    padding: isMobile ? '30px 20px' : '50px 40px',
    maxWidth: '400px',
    width: '90%',
    margin: 'auto',
    color: 'white',
    zIndex: 2
  };

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      width: '100%',
      backgroundColor: '#0a192f', // Navy blue background
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Blue gradient circles */}
      <div style={{
        position: 'absolute',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at center, #00b4db, #0083b0)',
        top: '-50px',
        right: '-50px',
        filter: 'blur(100px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at center, #1a2980, #26d0ce)',
        bottom: '-50px',
        left: '-50px',
        filter: 'blur(100px)',
        zIndex: 0
      }} />

      {/* Glassmorphic login box */}
      <form onSubmit={handleLogin} style={glassStyle}>
        <h2 style={{ 
          fontWeight: 'bold', 
          fontSize: '26px', 
          marginBottom: '10px',
          color: '#e6f1ff' // Light blue text
        }}>
          Login
        </h2>
        <p style={{ 
          marginBottom: '30px', 
          fontSize: '14px',
          color: '#ccd6f6' // Lighter blue text
        }}>
          Welcome Back Please Login To Your Account
        </p>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(100, 149, 237, 0.5)',
            marginBottom: '20px',
            background: 'rgba(10, 25, 47, 0.7)',
            color: '#e6f1ff',
            outline: 'none'
          }}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid rgba(100, 149, 237, 0.5)',
            background: 'rgba(10, 25, 47, 0.7)',
            color: '#e6f1ff',
            outline: 'none'
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid rgba(100, 149, 237, 0.5)',
            background: 'rgba(10, 25, 47, 0.7)',
            color: '#e6f1ff',
            outline: 'none'
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#ccd6f6'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: '#64ffda' }} // Teal accent color
            />
            Remember Me
          </label>
          <a href="#" style={{ color: '#64ffda', textDecoration: 'none' }}>Forgot Password?</a>
        </div>

        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(90deg, #1a2980, #26d0ce)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(38, 208, 206, 0.4)'
          }
        }}>
          Login
        </button>

        {error && <p style={{ 
          color: '#ff6b6b', 
          marginTop: '10px', 
          textAlign: 'center',
          fontSize: '14px'
        }}>
          {error}
        </p>}

        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          fontSize: '14px',
          color: '#ccd6f6'
        }}>
          Don't have an account? <a href="#" style={{ 
            color: '#64ffda', 
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            Signup
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;