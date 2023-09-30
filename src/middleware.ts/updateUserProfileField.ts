import { UserDocument } from "../models/user.model";

// Define a function to update user profile fields
export const updateUserProfileField = async (user: UserDocument, updateFields: Partial<UserDocument>) => {
    for (const field in updateFields) {
        if (updateFields.hasOwnProperty(field)) {
            // Use a type assertion to inform TypeScript that field is a string key
            const key = field as keyof UserDocument;
            (user[key] as any) = updateFields[key];
        }
    }
    await user.save();
};






