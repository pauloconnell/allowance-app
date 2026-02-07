This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).






// add db

DONE pollie_db_user 



Architecture:

App has seperate families 

each Family has Children 1-many

Family has Chores which can be assigned to any child 0-many

Family Parent creates chores and assigns to children
    Each Child stores it's chores in it's child db under: choreList  - which contains choreId,  nextDue, and isRecurring.

Each child creates it's DailyRecord => which contains that day's chores to track completion and earnings

Each new day Child logs in triggers last DailyRecord to be finalized and new record created -> missed days = no earnings TBD -> could have a cycle through days to get up to today FUTURE

TODO: Finalizing Daily Record ->  Completed Chores are removed from child choreList IF !isRecurring.   Await: Parent signs off to award earnings

TODO: new Daily record creation -> incomplete chores are 'rolled to today', child choreList searched for chores due before tomorrow and populated - if isRecurring, the next instance of that chore is triggered by updating the nextDue date (based on the intervalDays located in the object )   So, today's record has current instance, and choresList has next instance -> already have logic to ensure incomplete chore being 'rolled forward' cancels creating next instance of isRecurring








Next:



*** upon new day, autosubmit should add copyOfChildChoresSubmitted: IDailyChore[]; to old record -> but isn't  


dailyRecordService
APPROVE DAILY ACTION     line292 needs to be removed



1 DONE: api/Children/get?FamilyId  POST -> create child (Create api/Family route to getAllChildren )
2 zustand store gets all children from above api
3 complete circle: useFamilyStore - fetchChildren used in ChildDropdown component
Add loading spiner: dashboard - and all db actions

Refactor: 
- API should just call lib/data/services = 1 source of truth


TODOD (nice to have):


// ui dashboard




// BUGS












## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
