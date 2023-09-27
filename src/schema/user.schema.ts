import { object, string, TypeOf } from 'zod';

const allowedUserCategories = ['Student', 'Individual', 'Professional'];

export const createUserSchema = object({
    body: object({
        first_name: string({
            required_error: 'First Name is required'
        }),
        last_name: string({
            required_error: 'Last Name is required'
        }),
        email: string({
            required_error: 'Email is required',
        }).email('Not a valid email address'),
        phone: string({
            required_error: 'Phone Number is required'
        }),
        skills: string({
            required_error: 'Skills is required'
        }).array(), // Ensure skills is an array of strings
        date_of_birth: string().optional(),
        user_category: string({
            required_error: 'User Category is required'
        }).refine((value) => allowedUserCategories.includes(value), {
            message: 'Invalid user category',
        }),
        password: string({
            required_error: 'Password is required'
        }).min(6, 'Password is too short - should be a minimum of 6 characters"'),
        password_confirmation: string({
            required_error: 'Confirm your password',
        }),
    }).refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation']
    })
});

export type CreateUserInput = Omit<TypeOf<typeof createUserSchema>, 'body.password_confirmation'>;
