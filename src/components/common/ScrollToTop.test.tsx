import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ScrollToTop from './ScrollToTop';

function NavigateButton({ to }: { to: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>navigate</button>;
}

describe('ScrollToTop', () => {
  it('scrolls to the top when the route changes', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <NavigateButton to="/predictions" />
      </MemoryRouter>,
    );

    scrollTo.mockClear();
    fireEvent.click(getByRole('button', { name: 'navigate' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    scrollTo.mockRestore();
  });

  it('leaves home-page hash scrolling to the header navigation', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(
      <MemoryRouter initialEntries={['/#teams']}>
        <ScrollToTop />
      </MemoryRouter>,
    );

    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });
});
