'use client';

import { Loader2, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { ButtonHTMLAttributes, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from './base/Button';

type Props = {} & ButtonHTMLAttributes<HTMLButtonElement>;

const SignOutButton = ({ ...props }: Props) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  return (
    <Button
      variant="ghost"
      onClick={async () => {
        setIsSigningOut(true);

        try {
          await signOut();
        } catch (error) {
          toast.error('There was a problem while sighing out');
        } finally {
          setIsSigningOut(false);
        }
      }}
    >
      {isSigningOut ? <Loader2 className="animate-spin h-4 w-4" /> : <LogOut className='w-4 h-4'/>}
    </Button>
  );
};

export default SignOutButton;
