import { NextResponse } from 'next/server';
import { getAllVehicles, createVehicle } from '@/lib/vehicles';
import { sanitizeCreate } from "@/lib/sanitizeCreate";
import { normalizeRecord } from "@/lib/normalizeRecord"; 
import Vehicle from '@/models/Vehicle';

export async function GET() { 
   try { const vehicles = await getAllVehicles(); 
      const normalized = vehicles.map((v) => { 
         const n = normalizeRecord(v); 
         n.vehicleId = n._id; // model-specific ID field 
         return n; 
      }); 
      return NextResponse.json(normalized); 
   } catch (err) { 
      console.error("GET /api/vehicles error:", err); 
      return NextResponse.json( { error: "Failed to fetch vehicles" }, { status: 500 } ); 
   } 
}

export async function POST(req: Request) {
   try {
      const body = await req.json();
      //console.log('body:', body);

      // Sanitize input based on Vehicle schema 
      const sanitized = sanitizeCreate(Vehicle, body);
      

      // Clean mileage input
      if (sanitized.mileage) {
         sanitized.mileage = Number(sanitized.mileage.replace(/,/g, ''));
      }
      const vehicle = await createVehicle(sanitized);
      // note above function get _id and sets vehicleID in DB and response
      
      
            // Normalize output 
      const normalized = normalizeRecord(vehicle); 

      return NextResponse.json(normalized, { status: 201 });
   } catch (err) {
      console.error('Error creating vehicle:', err);
      return NextResponse.json({ error: 'Failed to create vehicle' },
          { status: 500 }
         );
   }
}
