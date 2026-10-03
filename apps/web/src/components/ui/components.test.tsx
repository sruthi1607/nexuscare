import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { Field } from './Field';
import { Input } from './Input';
import { Pagination } from './Pagination';
import { getPageItems } from './pagination-items';
import { ToastProvider } from './Toast';
import { useToast } from './toast-context';

describe('Field', () => {
  it('links label, hint and error to the control', () => {
    render(
      <Field label="Email" hint="We never share it" error="Enter a valid email" required>
        {(p) => <Input {...p} />}
      </Field>,
    );
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAccessibleDescription('We never share it Enter a valid email');
  });
});

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('stays disabled while loading even if disabled={false} is passed', () => {
    render(
      <Button loading disabled={false}>
        Save
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

describe('getPageItems', () => {
  it.each([
    [1, 5, [1, 2, 3, 4, 5]],
    [1, 12, [1, 2, 3, 4, 'ellipsis', 12]],
    [6, 12, [1, 'ellipsis', 5, 6, 7, 'ellipsis', 12]],
    [12, 12, [1, 'ellipsis', 9, 10, 11, 12]],
  ])('page %i of %i', (page, count, expected) => {
    expect(getPageItems(page, count)).toEqual(expected);
  });
});

describe('Pagination', () => {
  function Harness() {
    const [page, setPage] = useState(1);
    return <Pagination page={page} pageCount={3} onPageChange={setPage} />;
  }

  it('moves between pages and disables the ends', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ConfirmDialog', () => {
  it('waits for an async confirm before closing', async () => {
    const user = userEvent.setup();
    let resolveConfirm: () => void = () => undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve;
        }),
    );
    render(
      <ConfirmDialog
        trigger={<Button>Delete</Button>}
        title="Delete record?"
        description="This cannot be undone."
        tone="danger"
        confirmLabel="Delete permanently"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog', { name: /delete record/i });
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');

    await user.click(within(dialog).getByRole('button', { name: 'Delete permanently' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(within(dialog).getByRole('button', { name: 'Delete permanently' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();

    resolveConfirm();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('stays open when the confirm action fails', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        trigger={<Button>Remove</Button>}
        title="Remove?"
        description="Test"
        onConfirm={() => Promise.reject(new Error('network'))}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('Toast', () => {
  function Trigger() {
    const { toast } = useToast();
    return (
      <Button
        onClick={() => {
          toast({ title: 'Saved', description: 'All good', tone: 'success', duration: 0 });
        }}
      >
        Notify
      </Button>
    );
  }

  it('shows a toast in the notifications region and dismisses it', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(within(region).getByText('Saved')).toBeInTheDocument();

    await user.click(within(region).getByRole('button', { name: 'Dismiss notification' }));
    expect(within(region).queryByText('Saved')).not.toBeInTheDocument();
  });

  it('throws a helpful error outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Trigger />)).toThrow(/ToastProvider/);
  });
});
