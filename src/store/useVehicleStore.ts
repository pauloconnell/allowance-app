import { create } from 'zustand';
import type { IVehicle } from '@/types/IVehicle';

interface VehicleState {
  // Single vehicle (detail view)
  selectedVehicle: IVehicle | null;
  setSelectedVehicle: (vehicle: IVehicle) => void;
  clearSelectedVehicle: () => void;
  fetchVehicle: (id: string) => Promise<void>;

  // All vehicles (dashboard, dropdowns, forms)
  allVehicles: IVehicle[];
  setAllVehicles: (vehicles: IVehicle[]) => void;
  fetchAllVehicles: () => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  // --- Selected Vehicle ---
  selectedVehicle: null,

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  clearSelectedVehicle: () => set({ selectedVehicle: null }),

fetchVehicle: async (id) => {
  try {
    const res = await fetch(`/api/vehicles/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch vehicle: ${res.status}`);
    const data = await res.json();
    set({ selectedVehicle: data });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    set({ selectedVehicle: null });
  }
},


  // --- All Vehicles ---
  allVehicles: [],

  setAllVehicles: (vehicles) => set({ allVehicles: vehicles }),

  fetchAllVehicles: async () => {
    try {
    const res = await fetch(`/api/vehicles`);
     if (!res.ok) throw new Error(`Failed to fetch vehicles: ${res.status}`);
    const data = await res.json();
    set({ allVehicles: data });
  } catch (error) {
      console.error('Error fetching vehicles:', error);
    set({ allVehicles: [] });
  }
  },
}))
