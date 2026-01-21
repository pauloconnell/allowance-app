import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ServiceRecordForm from '@/components/Forms/ServiceRecordForm';
import '@testing-library/jest-dom';

// Mock router
vi.mock('next/navigation', () => ({
   useRouter: () => ({
      push: vi.fn(),
      back: vi.fn(),
   }),
}));

// Mock sanitizeInput
vi.mock('@/lib/sanitizeInput', () => ({
   sanitizeInput: vi.fn((v) => v),
}));

// Mock Zustand store
vi.mock('@/store/useVehicleStore', () => {
   const mockFetchAllVehicles = vi.fn().mockResolvedValue(undefined);
   const mockFetchVehicle = vi.fn().mockResolvedValue(undefined);

   const mockStoreState = {
      allVehicles: [
         {
            _id: 'veh1',
            year: 2020,
            make: 'Subaru',
            nickName: 'Scooby',
            mileage: 150000,
         },
         {
            _id: 'veh2',
            year: 2018,
            make: 'Toyota',
            nickName: 'Yota',
            mileage: 200000,
         },
      ],
      fetchAllVehicles: mockFetchAllVehicles,
      selectedVehicle: {
         _id: 'veh1',
         year: 2020,
         make: 'Subaru',
         nickName: 'Scooby',
         mileage: 150000,
      },
      fetchVehicle: mockFetchVehicle,
   };

   return {
      useVehicleStore: ((selector: any) => selector(mockStoreState)) as any,
   };
});

// Mock fetch
global.fetch = vi.fn();

describe('ServiceRecordForm', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('renders initial form fields', () => {
      render(<ServiceRecordForm vehicleId="veh1" />);

      expect(screen.getByLabelText(/Date Service Performed/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Completed By/i)).toBeInTheDocument();
   });

   it('auto-fills nickname and mileage when vehicleId changes', () => {
      render(<ServiceRecordForm vehicleId="veh1" />);

      const vehicleSelect = screen.getByDisplayValue('2020 Subaru Scooby');

      fireEvent.change(vehicleSelect, { target: { value: 'veh2' } });

      expect(screen.getByDisplayValue('2018 Toyota Yota')).toBeTruthy();
      expect(screen.getByDisplayValue('200000')).toBeTruthy();
   });

   it('updates generic fields via handleChange', () => {
      render(<ServiceRecordForm vehicleId="veh1" />);

      const completedBy = screen.getByPlaceholderText(/Technician Name/i);

      fireEvent.change(completedBy, {
         target: { name: 'completedBy', value: 'Paul' },
      });

      expect(completedBy).toHaveValue('Paul');
   });

   it('submits form successfully and redirects', async () => {
      (fetch as any).mockResolvedValueOnce({ ok: true });

      const { container } = render(<ServiceRecordForm vehicleId="veh1" />);

      const completedBy = screen.getByPlaceholderText(/Technician Name/i);
      fireEvent.change(completedBy, {
         target: { name: 'completedBy', value: 'Paul' },
      });

      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
         expect(fetch).toHaveBeenCalledWith(
            '/api/service-records',
            expect.objectContaining({
               method: 'POST',
            })
         );
      });
   });

   it('alerts on failed submit', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      (fetch as any).mockResolvedValueOnce({ ok: false });

      const { container } = render(<ServiceRecordForm vehicleId="veh1" />);

      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
         expect(alertSpy).toHaveBeenCalledWith('Failed to save record');
      });
   });
});
