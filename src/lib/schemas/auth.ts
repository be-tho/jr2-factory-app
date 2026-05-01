import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Ingresá un email válido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().trim().email('Ingresá un email válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Ingresá un email válido.'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'Mínimo 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirmá la contraseña.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Los passwords no coinciden.',
    path: ['confirmPassword'],
  })

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>
