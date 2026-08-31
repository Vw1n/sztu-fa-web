import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CardFields from '../components/CardFields';
import './pages.css';

export default function Register() {
  const [username, setUsername] = useState(''), [nickname, setNickname] = useState('');
  const [password, setPassword] = useState(''), [confirm, setConfirm] = useState(''), [show, setShow] = useState(false);
  const [realName, setRealName] = useState(''), [studentId, setStudentId] = useState('');
  const [card, setCard] = useState<File | null>(null), [consent, setConsent] = useState(false);
  const [error, setError] = useState(''), [loading, setLoading] = useState(false);
  const { register } = useAuth(); const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (loading) return;
    if (!card || !consent) { setError('请上传校园卡并确认材料使用说明'); return; }
    if (password !== confirm) { setError('两次输入的密码不一致'); return; }
    setLoading(true); setError('');
    try { await register({ username: username.trim(), password, nickname: nickname.trim() || undefined,
      realName: realName.trim(), studentId: studentId.trim(), campusCard: card }); navigate('/verification'); }
    catch (e) { setError(e instanceof Error ? e.message : '注册失败，请重试'); }
    finally { setLoading(false); }
  }
  return <div className="pageLayout"><Header /><main className="mainContent flexCenter"><div className="authCard verification-card">
    <div className="authHeader"><h2>注册校园账号</h2><p>提交校园卡，经人工审核后参与竞猜。审核通过后自动删除图片。</p></div>
    {error && <p role="alert" className="errorMessage">{error}</p>}
    <form className="authForm" onSubmit={submit}><fieldset disabled={loading}>
      <div className="formGroup"><label htmlFor="username">用户名</label><input id="username" autoComplete="username" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_-]{3,30}" title="3–30 位字母、数字、下划线或连字符" value={username} onChange={e => setUsername(e.target.value)} /><small>3–30 位字母、数字、下划线或连字符</small></div>
      <div className="formGroup"><label htmlFor="nickname">昵称（选填）</label><input id="nickname" maxLength={30} value={nickname} onChange={e => setNickname(e.target.value)} /><small>公开排行榜显示昵称，不公开申请姓名。</small></div>
      <div className="formGroup"><label htmlFor="password">密码</label><input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={6} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /><small>至少 6 个字符。</small><button type="button" className="authLink" onClick={() => setShow(!show)}>{show ? '隐藏密码' : '显示密码'}</button></div>
      <div className="formGroup"><label htmlFor="confirmPassword">确认密码</label><input id="confirmPassword" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={6} maxLength={128} value={confirm} onChange={e => setConfirm(e.target.value)} />{confirm && confirm !== password && <small role="status">两次密码尚不一致</small>}</div>
      <CardFields realName={realName} onName={setRealName} studentId={studentId} onStudentId={setStudentId} file={card} onFile={setCard} consent={consent} onConsent={setConsent} />
      <button type="submit" className="submitBtn">{loading ? '正在上传并提交…' : '提交注册申请'}</button>
    </fieldset></form>
  </div></main><Footer /></div>;
}
