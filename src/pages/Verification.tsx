import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts';
import { resubmitCard } from '../api/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CardFields from '../components/CardFields';
import './pages.css';
const labels: Record<string, string> = { PENDING: '校园卡待审核', APPROVED: '校园卡审核通过', CHANGES_REQUESTED: '请补充校园卡材料', LEGACY: '请补交校园卡完成认证' };
export default function Verification() {
  const { user, loading, refreshUser } = useAuth();
  const [realName, setRealName] = useState(''), [studentId, setStudentId] = useState(''), [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!file || !consent || busy) return;
    setBusy(true); setError('');
    try { await resubmitCard(realName.trim(), studentId.trim(), file); setFile(null); await refreshUser(); }
    catch (e) { setError(e instanceof Error ? e.message : '提交失败'); }
    finally { setBusy(false); }
  }
  return <div className="pageLayout"><Header /><main className="mainContent flexCenter"><div className="authCard verification-card">
    {loading ? <p>加载中…</p> : !user ? <p>请先<Link to="/login">登录</Link>，或<Link to="/register">注册并上传校园卡</Link>。</p> : <>
      <h2>{labels[user.verificationStatus || 'LEGACY']}</h2><p>{user.verificationStatus === 'APPROVED' ? '审核已通过，图片自动清理，不再提供查看。' : '审核通过前可浏览赛事，但不能提交新助威。历史记录和积分保留。'}</p>
      {user.reviewComment && <p role="status">审核说明：{user.reviewComment}</p>}
      <button className="submitBtn" disabled={busy} onClick={() => void refreshUser()}>刷新审核状态</button>
      {user.verificationStatus === 'APPROVED' ? <p><Link to="/predictions">前往助威</Link></p> : <>
        <p>材料不清晰、学号冲突或其他疑问，请联系网站管理员人工核实；请勿在公开评论中发送校园卡照片。</p>
        {error && <p role="alert" className="errorMessage">{error}</p>}
        <form className="authForm" onSubmit={submit}><fieldset disabled={busy}><CardFields realName={realName} onName={setRealName} studentId={studentId} onStudentId={setStudentId} file={file} onFile={setFile} consent={consent} onConsent={setConsent} /><button className="submitBtn">{busy ? '提交中…' : '提交 / 更新校园卡材料'}</button></fieldset></form>
      </>}
    </>}
  </div></main><Footer /></div>;
}
