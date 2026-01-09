This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).






// add db

pollie_db_user 

DONE: we need a page for 'create work order' which essentially just uses the same 'service' form, but instead creates a work order instead of a service record

DONE  need to be able to delete a work order => button on work order to 'convert to completed service record' which deletes the work order and saves as completed service record


DONE : save work orders, retrieve work orders, mark complete and save as service record 
DONE keep work orders seperate from service records - have state of open/completed - the api should only retrieve work orders that are open, seperate endpoint for 'completed' work orders - add in tech's name

WIP: add Zustand - 
DONE:work order store
WIP=> vehicle store

NEXT: need name of vehicle saved into work order to tell which vehicle when dashboard showing list of all outstanding work orders



TODOD (nice to have):
remove list of vehicles from work orders and 

// ui dashboard
=> move 'record service' down and center 'dashboard'
=> same for 'add vehicle' - move down and flex align to start finish
/vehicles/
=> spread create work order, 3 buttons flex across width space even



// BUGS
-> Create work order Location: n/a isn't clickable











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
