import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/employees';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: '',
    receiptUrl: ''
  });

  const token = localStorage.getItem('token');

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses.docs || data.expenses); // handle pagination and non-paginated
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (data.success) {
      alert('Expense submitted!');
      setForm({ amount: '', description: '', category: '', receiptUrl: '' });
      fetchExpenses();
    } else {
      alert(data.message);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Submit Expense</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />
        <br />
        <input
          type="text"
          name="receiptUrl"
          placeholder="Receipt URL"
          value={form.receiptUrl}
          onChange={handleChange}
        />
        <br />
        <button type="submit">Submit</button>
      </form>

      <h2>Your Expenses</h2>
      <button onClick={fetchExpenses}>Refresh</button>
      <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%', maxWidth: '800px' }}>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Description</th>
            <th>Category</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{expense.amount}</td>
                <td>{expense.description}</td>
                <td>{expense.category}</td>
                <td>{expense.status}</td>
                <td>{new Date(expense.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No expenses found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTracker;
