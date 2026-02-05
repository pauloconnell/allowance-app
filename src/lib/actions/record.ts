import { redirect } from 'next/navigation';
import { getOrCreateTodaysDailyRecord } from '@/lib/data/dailyRecordService';


// Logic for creating new Record -> this should only happen once, as API will generate next record upon completion of current day's record.
   export async function handleCreateRecordForToday(childId: string, familyId: string) {
   
      if (!childId || !familyId){
            console.error('Child ID and Family ID are required to create a daily record.');
            return;
      } 
      let newId: string = '';
      
         console.log("Create a new record for today...");
         let newRecord = await getOrCreateTodaysDailyRecord(childId, familyId);
         
         newRecord = JSON.parse(JSON.stringify(newRecord)); // serialize for client use
         newId=newRecord._id;
         console.log("Created new record for today:", newRecord);
        
      
       redirect(`/protectedPages/${familyId}/daily-records/${newId}?childId=${childId}`);
   };