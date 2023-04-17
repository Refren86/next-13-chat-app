import { Inter } from 'next/font/google';

import { Button } from '@/components/base/Button';

const inter = Inter({ subsets: ['latin'] });

export default async function Home() {
  return (
    <main className={inter.className}>
      <div className="text-red-500">Hi Mom</div>
      <Button variant="ghost">Click me</Button>
    </main>
  );
}
