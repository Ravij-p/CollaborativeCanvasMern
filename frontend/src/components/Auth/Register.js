import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token);
      navigate('/home');
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <input type="text" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Register</button>
      <p>Already have an account? <Link to="/" className="text-blue-500">Login</Link></p>
    </form>
  );
};

export default Register;
