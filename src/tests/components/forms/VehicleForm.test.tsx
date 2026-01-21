import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehicleForm from '@/components/Forms/Vehicle/VehicleForm';
import '@testing-library/jest-dom';

vi.mock('next/navigation', () => {
  const mockRouter = {
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  };
  return { useRouter: () => mockRouter };
});

// Mock toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock sanitizeInput
vi.mock('@/lib/sanitizeInput', () => ({
  sanitizeInput: vi.fn((v) => v),
}));

// Mock fetch
global.fetch = vi.fn();

describe('VehicleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form in create mode', () => {
    render(<VehicleForm />);

    expect(screen.getByPlaceholderText('Year')).toHaveValue('');
    expect(screen.getByPlaceholderText('Make')).toHaveValue('');
    expect(screen.getByPlaceholderText('Model')).toHaveValue('');
    expect(screen.getByPlaceholderText('Nick Name')).toHaveValue('');
    expect(screen.getByPlaceholderText('Mileage')).toHaveValue('');
    expect(screen.getByPlaceholderText('VIN')).toHaveValue('');
  });

  it('renders prefilled form in edit mode', () => {
    const vehicle = {
      year: 2020,
      make: 'Subaru',
      model: 'Outback',
      nickName: 'Scooby',
      mileage: 150000,
      vin: '123VIN',
      _id: 'veh123',
      vehicleId: 'veh123',
    };

    render(<VehicleForm vehicle={vehicle} />);

    expect(screen.getByPlaceholderText('Year')).toHaveValue('2020');
    expect(screen.getByPlaceholderText('Make')).toHaveValue('Subaru');
    expect(screen.getByPlaceholderText('Model')).toHaveValue('Outback');
    expect(screen.getByPlaceholderText('Nick Name')).toHaveValue('Scooby');
    expect(screen.getByPlaceholderText('Mileage')).toHaveValue('150000');
    expect(screen.getByPlaceholderText('VIN')).toHaveValue('123VIN');
  });

  it('updates form fields via handleChange', () => {
    render(<VehicleForm />);

    const makeInput = screen.getByPlaceholderText('Make');

    fireEvent.change(makeInput, { target: { name: 'make', value: 'Toyota' } });

    expect(makeInput).toHaveValue('Toyota');
  });

  it('submits create mode and redirects', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true });

    const { container } = render(<VehicleForm />);

    fireEvent.change(screen.getByPlaceholderText('Make'), {
      target: { name: 'make', value: 'Honda' },
    });

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/vehicles',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('submits edit mode and redirects', async () => {
    const vehicle = {
      year: 2020,
      make: 'Subaru',
      model: 'Outback',
      nickName: 'Scooby',
      mileage: 150000,
      vin: '123VIN',
      _id: 'veh123',
      vehicleId: 'veh123',
    };

    (fetch as any).mockResolvedValueOnce({ ok: true });

    const { container } = render(<VehicleForm vehicle={vehicle} />);

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/vehicles/veh123',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  it('cancel button calls router.back()', async () => {
    const { useRouter } = await import('next/navigation');
    const mockRouter = vi.mocked(useRouter)();

    render(<VehicleForm />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockRouter.back).toHaveBeenCalled();
  });
});
