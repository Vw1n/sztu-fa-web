import { useEffect, useState } from 'react';
interface Props { realName: string; onName: (value: string) => void; studentId: string; onStudentId: (value: string) => void;
  file: File | null; onFile: (file: File | null) => void; consent: boolean; onConsent: (value: boolean) => void; }
export default function CardFields(props: Props) {
  const [preview, setPreview] = useState(''), [error, setError] = useState('');
  useEffect(() => { if (!props.file) { setPreview(''); return; } const url = URL.createObjectURL(props.file); setPreview(url); return () => URL.revokeObjectURL(url); }, [props.file]);
  return <>
    <div className="formGroup"><label htmlFor="realName">校园卡姓名（仅用于审核）</label><input id="realName" autoComplete="name" required minLength={2} maxLength={50} value={props.realName} onChange={e => props.onName(e.target.value)} /></div>
    <div className="formGroup"><label htmlFor="studentId">学号</label><input id="studentId" required pattern="[a-zA-Z0-9_-]{6,20}" title="6–20 位字母、数字、下划线或连字符" value={props.studentId} onChange={e => props.onStudentId(e.target.value)} /></div>
    <div className="formGroup"><label htmlFor="campusCard">校园卡照片（必填）</label><input id="campusCard" type="file" accept="image/jpeg,image/png,image/webp" required aria-describedby="card-help" onChange={e => {
      const file = e.target.files?.[0] || null; setError('');
      if (file && (file.size > 3 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) { setError('请使用不超过 3 MB 的 JPG、PNG 或 WebP 图片'); props.onFile(null); e.target.value = ''; return; }
      props.onFile(file);
    }} /><small id="card-help">学校、姓名和学号须清晰。可遮挡头像、二维码、条码、消费卡号等无关信息。不需要上传身份证或手持证件照。</small>
      {error && <p role="alert" className="errorMessage">{error}</p>}{preview && <img className="campus-card-preview" src={preview} alt="待提交校园卡预览" />}
    </div>
    <div className="card-privacy"><strong>校园卡材料使用说明</strong><p>图片仅供授权管理员核验，不公开展示。审核通过后立即自动删除；存储服务异常时关闭访问并自动重试删除。未提交材料最长保留 24 小时，待审核或待补充材料最长保留 30 天。保留必要审核记录。</p><label><input type="checkbox" required checked={props.consent} onChange={e => props.onConsent(e.target.checked)} />我已阅读说明，并确认提交的是本人校园卡材料。</label></div>
  </>;
}
