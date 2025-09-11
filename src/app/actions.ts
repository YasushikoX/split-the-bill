'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function createBillSession() {
  const id = crypto.randomUUID();
  redirect(`/bill/${id}`);
}

export async function getBaseUrl() {
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${host}`;
}
