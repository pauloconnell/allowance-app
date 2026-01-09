import { create } from 'zustand';
import type { IVehicle } from '@/types/vehicle';

interface VehicleState {
  selectedVehicle: IVehicle | null;
  setSelectedVehicle: (vehicle: IVehicle) => void;
  clearSelectedVehicle: () => void;
  fetchVehicle: (id: string) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  selectedVehicle: null,

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  clearSelectedVehicle: () => set({ selectedVehicle: null }),

  fetchVehicle: async (id) => {
    const res = await fetch(`/api/vehicles/${id}`);
    const data = await res.json();
    set({ selectedVehicle: data });
  },
}));
