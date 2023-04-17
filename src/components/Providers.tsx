'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

type Props = {
  children: ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      {children}
    </>
  );
};

export default Providers;
