import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './pages.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [studentId, setStudentId] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!studentId.trim()) {
      setError('普通用户注册必须填写绑定学号');
      return;
    }
    if (password.length < 6) {
      setError('密码长度不能少于 6 位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(
        username.trim(),
        password,
        studentId.trim(),
        nickname.trim() || undefined,
      );
      navigate('/predictions');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '注册失败，请核对信息后再试';
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
            <h2>注册账号并绑定学号</h2>
            <p>为保证校园赛事互动公平性，普通账号须绑定唯一真实学号</p>
          </div>

          {error && <div className="errorMessage">{error}</div>}

          <form onSubmit={handleSubmit} className="authForm">
            <div className="formGroup">
              <label htmlFor="username">
                用户名 <span className="required">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="设置登录用户名"
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="studentId">
                学号 <span className="required">*</span>
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="例如：2023123456（唯一绑定，无法自行修改）"
                required
              />
              <small className="fieldHint">
                学号绑定后将在排行榜中脱敏展示（如 2023****56）
              </small>
            </div>

            <div className="formGroup">
              <label htmlFor="nickname">用户昵称</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="排行榜展示的昵称（选填，默认与用户名一致）"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="password">
                密码 <span className="required">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="设置 6 位以上密码"
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="confirmPassword">
                确认密码 <span className="required">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                required
              />
            </div>

            <button type="submit" className="submitBtn" disabled={loading}>
              {loading ? '注册中...' : '注册并绑定学号'}
            </button>
          </form>

          <div className="authFooter">
            <span>已有账号？</span>
            <Link to="/login" className="authLink">
              立即登录
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
