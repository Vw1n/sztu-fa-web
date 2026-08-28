import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from './Register';
const register = vi.fn();
vi.mock('../contexts', () => ({ useAuth: () => ({ register }) }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
describe('校园卡注册表单', () => {
  beforeEach(() => { register.mockReset(); URL.createObjectURL = vi.fn(() => 'blob:test'); URL.revokeObjectURL = vi.fn(); });
  it('没有校园卡时不能通过表单提交，展示删除说明', () => {
    const { container } = render(<MemoryRouter><Register /></MemoryRouter>);
    fireEvent.submit(container.querySelector('form')!);
    expect(register).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('请上传校园卡');
    expect(screen.getByText(/审核通过后立即自动删除/)).toBeInTheDocument();
  });
  it('非法格式和超大图片不能成为注册材料', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const input = screen.getByLabelText('校园卡照片（必填）');
    fireEvent.change(input, { target: { files: [new File(['<svg/>'], 'card.svg', { type: 'image/svg+xml' })] } });
    expect(screen.getByRole('alert')).toHaveTextContent('不超过 3 MB');
    expect(register).not.toHaveBeenCalled();
  });
  it('两次密码输入不一致时阻止提交并显示错误', () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'PasswordA!123456' } });
    fireEvent.change(screen.getByLabelText('确认密码'), { target: { value: 'PasswordB!123456' } });
    fireEvent.change(screen.getByLabelText('校园卡姓名（仅用于审核）'), { target: { value: '张三' } });
    fireEvent.change(screen.getByLabelText('学号'), { target: { value: '20261111' } });
    fireEvent.change(screen.getByLabelText('校园卡照片（必填）'), {
      target: { files: [new File(['card'], 'card.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.submit(container.querySelector('form')!);
    expect(register).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('两次输入的密码不一致');
  });

  it('完整填写信息且同意说明后成功提交并调用 register', async () => {
    register.mockResolvedValueOnce({ user: { id: 'm1' } });
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    const validCard = new File(['valid-img'], 'card.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('用户名'), { target: { value: ' valid_student ' } });
    fireEvent.change(screen.getByLabelText('昵称（选填）'), { target: { value: ' 昵称 ' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'SafePassword!2026' } });
    fireEvent.change(screen.getByLabelText('确认密码'), { target: { value: 'SafePassword!2026' } });
    fireEvent.change(screen.getByLabelText('校园卡姓名（仅用于审核）'), { target: { value: ' 李四 ' } });
    fireEvent.change(screen.getByLabelText('学号'), { target: { value: ' 20262222 ' } });
    fireEvent.change(screen.getByLabelText('校园卡照片（必填）'), {
      target: { files: [validCard] },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.submit(container.querySelector('form')!);
    expect(register).toHaveBeenCalledWith({
      username: 'valid_student',
      nickname: '昵称',
      password: 'SafePassword!2026',
      realName: '李四',
      studentId: '20262222',
      campusCard: validCard,
    });
  });
});
