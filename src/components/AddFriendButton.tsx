'use client';

import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from './base/Button';
import { addFriendValidator } from '@/lib/validations/add-friend';
import Input from './base/Input';

type Props = {};
type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton = ({}: Props) => {
  const [addFriendSucceed, setAddFriendSucceed] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  async function addFriend(email: string) {
    try {
      const validatedEmail = addFriendValidator.parse({ email });

      await axios.post('/api/friends/add', { email: validatedEmail });

      setAddFriendSucceed(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError('email', { message: error.message });
        return;
      }

      if (error instanceof AxiosError) {
        setError('email', { message: error.response?.data });
        return;
      }

      setError('email', { message: 'Something went wrong' });
    }
  }

  function onSubmit(data: FormData) {
    addFriend(data.email);
  }

  return (
    <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="email"
        label="Add friend by E-Mail"
        placeholder="email@example.com"
        error={errors.email}
        register={register}
      />
      <Button className="mt-4">Add</Button>

      {addFriendSucceed && <p className="mt-1 text-sm text-green-600">Friend request sent!</p>}
    </form>
  );
};

export default AddFriendButton;
