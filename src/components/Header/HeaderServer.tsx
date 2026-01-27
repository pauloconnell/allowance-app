import { getSession } from '@auth0/nextjs-auth0';
import HeaderClient from './HeaderClient';

export default async function HeaderServer() {
   const session = (await getSession()) ?? null;

   const safeSession = session
      ? {
           user: {
              name: session.user.name ?? null,
              email: session.user.email ?? null,
              picture: session.user.picture ?? null,
           },
        }
      : null;

   return <HeaderClient  />;
}
