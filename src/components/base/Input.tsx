import { InputHTMLAttributes } from 'react';
import { UseFormRegister, FieldError, FieldValues, Path } from 'react-hook-form';

type FormInputProps<T extends FieldValues> = {
  id: Path<T>;
  label: string;
  error?: FieldError;
  required?: boolean;
  register?: UseFormRegister<T>;
} & InputHTMLAttributes<HTMLInputElement>;

const Input = <T extends FieldValues>({
  id,
  label,
  required = false,
  error,
  register,
  ...otherProps
}: FormInputProps<T>) => (
  <>
    <label htmlFor={id} className="block mb-2 text-sm font-medium leading-6 text-gray-900">
      {label}
    </label>

    <input
      id={id}
      className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      {...register?.(id, { required })}
      {...otherProps}
    />

    {error?.message && <div className="mt-1 text-sm text-red-600">{error?.message}</div>}
  </>
);

export default Input;
