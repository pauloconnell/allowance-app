import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

async function runMigration() {
   try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
         throw new Error("Please define MONGODB_URI in your environment variables");
      }

      console.log('Connecting to database...');
      await mongoose.connect(MONGODB_URI);

      const db = mongoose.connection.db;
      if (!db) {
         throw new Error("Failed to connect to database instance");
      }

      const collection = db.collection('dailyrecords');

      // 1. Drop the old unique index referencing dueDate safely
      try {
         console.log('Attempting to drop old index: familyId_1_childId_1_dueDate_-1...');
         await collection.dropIndex('familyId_1_childId_1_dueDate_-1');
         console.log('Old index dropped successfully.');
      } catch (err: any) {
         console.log('Note: Old index might already be dropped or not found:', err.message);
      }

      // 2. Run the raw rename operation
      console.log('Running migration: renaming dueDate to recordDate...');
      const result = await collection.updateMany(
         { dueDate: { $exists: true } }, 
         { $rename: { dueDate: 'recordDate' } }
      );

      console.log(`Migration successful! Modified ${result.modifiedCount} documents.`);

      // 3. Create the new unique index with recordDate
      console.log('Creating new unique index on recordDate...');
      await collection.createIndex(
         { familyId: 1, childId: 1, recordDate: -1 },
         { unique: true }
      );
      console.log('New unique index created successfully.');

      await mongoose.disconnect();
      process.exit(0);
   } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
   }
}

runMigration();