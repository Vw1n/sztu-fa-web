import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './pages.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(username.trim(), password);
      navigate('/predictions');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请检查用户名和密码';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageLayout">
      <Header />
      <main className="mainContent flexCenter">
        <div className="authCard">
          <div className="authHeader">
            <h2>用户登录</h2>
            <p>登录 SZTUFA 账号参与校园赛事竞猜与排行榜竞争</p>
          </div>

          {error && <div className="errorMessage">{error}</div>}

          <form onSubmit={handleSubmit} className="authForm">
            <div className="formGroup">
              <label htmlFor="username">用户名</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="password">密码</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
            </div>

            <button type="submit" className="submitBtn" disabled={loading}>
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>

          <div className="authFooter">
            <span>还没有账号？</span>
            <Link to="/register" className="authLink">
              注册并绑定学号
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
