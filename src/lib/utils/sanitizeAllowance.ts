import Child from '@/models/Child';
import Chore from '@/models/Chore';
import DailyRecord from '@/models/DailyRecord';
import { IChild } from '@/types/IChild';
import { IChore } from '@/types/IChore';
import { IDailyRecord } from '@/types/IDailyRecord';

/**
 * Sanitization rules for Child creation
 */
const childSanitization = {
   name: (val: any) => String(val).trim(),
   age: (val: any) => {
      const num = parseInt(val);
      return num > 0 && num < 150 ? num : 0;
   },
   currentBalance: (val: any) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 ? num : 0;
   },
   avatarUrl: (val: any) => (val ? String(val).trim() : null),
};

/**
 * Sanitization rules for Chore creation
 */
const choreSanitization = {
   taskName: (val: any) => String(val).trim().substring(0, 255),
   rewardAmount: (val: any) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 ? parseFloat(num.toFixed(2)) : 0;
   },
   isRecurring: (val: any) => Boolean(val),
   intervalDays: (val: any) => {
      const num = parseInt(val);
      return num > 0 ? num : null;
   },
   suggestedTime: (val: any) => (val ? String(val).trim().substring(0, 50) : null),
   dueDate: (val: any) => (val ? new Date(val) : null),
   isActive: (val: any) => Boolean(val),
};

/**
 * Sanitization rules for DailyRecord creation
 */
const dailyRecordSanitization = {
   date: (val: any) => new Date(val),
   status: (val: any) => {
      const validStatuses = ['pending', 'submitted', 'approved', 'rejected'];
      return validStatuses.includes(val) ? val : 'pending';
   },
   notes: (val: any) => (val ? String(val).trim().substring(0, 1000) : ''),
};

/**
 * Get sanitization rules for a model
 */
function getSanitizationRules(model: any): Record<string, (val: any) => any> {
   if (model.modelName === 'Child') {
      return childSanitization;
   } else if (model.modelName === 'Chore') {
      return choreSanitization;
   } else if (model.modelName === 'DailyRecord') {
      return dailyRecordSanitization;
   }
   return {};
}

/**
 * Sanitize input for creation based on model
 * Adapted from existing sanitizeCreate pattern
 */
export function sanitizeCreateAllowance(
   model: any,
   data: Record<string, any>
): Record<string, any> {
   const rules = getSanitizationRules(model);
   const sanitized: Record<string, any> = {};

   for (const [key, value] of Object.entries(data)) {
      if (key in rules && value !== undefined && value !== null) {
         sanitized[key] = rules[key](value);
      } else if (key === 'familyId' || key === 'childId' || key === 'choreId') {
         // Pass through IDs without modification
         sanitized[key] = value;
      }
   }

   return sanitized;
}

/**
 * Sanitize updates for existing records
 */
export function sanitizeUpdateChild(data: Partial<IChild>): Partial<IChild> {
   const sanitized: Partial<IChild> = {};

   if (data.name) sanitized.name = String(data.name).trim();
   if (data.age !== undefined) sanitized.age = Math.max(0, parseInt(String(data.age)));
   if (data.avatarUrl !== undefined) sanitized.avatarUrl = data.avatarUrl;

   return sanitized;
}

export function sanitizeUpdateChore(data: Partial<IChore>): Partial<IChore> {
   const sanitized: Partial<IChore> = {};

   if (data.taskName) sanitized.taskName = String(data.taskName).trim();
   if (data.rewardAmount !== undefined) {
      sanitized.rewardAmount = Math.max(0, parseFloat(String(data.rewardAmount)));
   }
   if (data.isRecurring !== undefined) sanitized.isRecurring = Boolean(data.isRecurring);
   if (data.intervalDays !== undefined) {
      sanitized.intervalDays = parseInt(String(data.intervalDays)) || undefined;
   }
   if (data.suggestedTime) sanitized.suggestedTime = String(data.suggestedTime).trim();
   if (data.dueDate) sanitized.dueDate = new Date(data.dueDate);

   return sanitized;
}

export function sanitizeUpdateDailyRecord(
   data: Partial<IDailyRecord>
): Partial<IDailyRecord> {
   const sanitized: Partial<IDailyRecord> = {};

   if (data.notes) sanitized.notes = String(data.notes).trim();
   if (data.status) {
      const validStatuses = ['pending', 'submitted', 'approved', 'rejected'];
      if (validStatuses.includes(data.status)) {
         sanitized.status = data.status;
      }
   }

   return sanitized;
}
