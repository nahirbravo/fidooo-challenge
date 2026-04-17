import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().min(1, 'validation.required').email('validation.email'),
  password: z.string().min(1, 'validation.required'),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    email: z.string().min(1, 'validation.required').email('validation.email'),
    password: z
      .string()
      .min(8, 'validation.passwordMin')
      .regex(/[A-Z]/, 'validation.passwordUpper')
      .regex(/\d/, 'validation.passwordDigit'),
    confirmPassword: z.string().min(1, 'validation.required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordMatch',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof RegisterSchema>;

export const SignUpSchema = z.object({
  email: z.string().min(1, 'validation.required').email('validation.email'),
  password: z
    .string()
    .min(8, 'validation.passwordMin')
    .regex(/[A-Z]/, 'validation.passwordUpper')
    .regex(/\d/, 'validation.passwordDigit'),
});

export type SignUpValues = z.infer<typeof SignUpSchema>;

export const ForgotSchema = z.object({
  email: z.string().min(1, 'validation.required').email('validation.email'),
});

export type ForgotFormValues = z.infer<typeof ForgotSchema>;
