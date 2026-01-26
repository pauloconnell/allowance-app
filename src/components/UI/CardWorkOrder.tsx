'use client';
import Link from 'next/link';
import { Calendar, Gauge, ChevronRight, AlertCircle, Info, Wrench } from 'lucide-react';
import { IWorkOrder } from '@/types/IWorkOrder';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';


interface WorkOrderProps {
   wo: IWorkOrder;
   familyId: string;
}

export const CardWorkOrder = ({ wo, familyId }: WorkOrderProps) => {
   const { setSelectedWorkOrder } = useWorkOrderStore.getState();
  // Logic: Check if service is past due
  const isOverdue = wo.serviceDueDate && new Date(wo.serviceDueDate) < new Date();
  
  // Format date: "Jan 22, 2026"
  const dateFormatted = wo.serviceDueDate 
    ? new Date(wo.serviceDueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'No date set';

  return (
    <li className="list-none">
      <Link
        href={`/protectedPages/${familyId}/work-orders/${wo._id}`}
        onClick={() => setSelectedWorkOrder(wo)}
        className="wo-card group flex items-center justify-between"
      >
        {/* Status Bar (Left side accent) */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${isOverdue ? 'bg-red-500' : 'bg-primary-500'}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-secondary-950 text-lg truncate">
              {wo.nickName || 'General Service'}
            </h3>
            
            {/* Status Badge */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              isOverdue 
                ? 'bg-red-50 text-red-700 border-red-100' 
                : 'bg-primary-50 text-primary-700 border-primary-100'
            }`}>
              {isOverdue ? 'Action Required' : ""}
            </span>
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6">

               <div className="flex items-center text-md text-secondary-500 font-medium">
              <Wrench className={`w-4 h-4 mr-2 ${isOverdue ? 'text-red-500' : 'text-primary-500'}`} />
              
              { wo.serviceType}
            </div>
            <div className="flex items-center text-sm text-secondary-500 font-medium">
              <Calendar className={`w-4 h-4 mr-2 ${isOverdue ? 'text-red-500' : 'text-primary-500'}`} />
              Due: {dateFormatted}
            </div>

            {wo.serviceDueKM && (
              <div className="flex items-center text-sm text-secondary-500 font-medium">
                <Gauge className="w-4 h-4 mr-2 text-primary-500" />
                Due:{wo.serviceDueKM.toLocaleString()} <span className="ml-1 text-[10px] uppercase opacity-60">km</span>
              </div>
            )}

            {wo.serviceType === 'Other' && wo.notes && (
              <div className="flex items-center text-sm text-secondary-400 italic truncate max-w-[200px]">
                <Info className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                {wo.notes}
              </div>
            )}
          </div>
        </div>

        {/* Action Indicator */}
        <div className="ml-4 flex-shrink-0">
          <div className="p-2 rounded-full bg-secondary-50 text-secondary-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </Link>
    </li>
  );
};