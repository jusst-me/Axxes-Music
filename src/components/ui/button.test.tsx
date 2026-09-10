import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { axe } from '@/lib/testing/axe';

describe('Button', () => {
  it('exposes its label as the accessible name', () => {
    render(<Button>Play</Button>);

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('can be activated with the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Play</Button>);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Play' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Play</Button>);

    expect(await axe(container)).toHaveNoViolations();
  });
});
