import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import config from 'config';

// Define the string literal type for user_category
type UserCategory = "Student" | "Individual" | "Professional";

export interface UserDocument extends mongoose.Document {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    skills: string[];
    date_of_birth?: string;
    user_category: UserCategory;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate_password: string): Promise<boolean>;
}

export interface UserDocumentWithResetToken extends UserDocument {
    resetToken: string;
    resetTokenExpiration: Date;
}

const userSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        skills: [{ type: String, required: true }], // Define skills as an array of strings
        date_of_birth: { type: String, required: false },
        user_category: {
            type: String,
            required: true,
            enum: ["Student", "Individual", "Professional"] // Restrict values to the specified strings
        },
        password: { type: String, required: true }
    }
);

// Hash password on save
userSchema.pre("save", async function (next) {
    let user = this as UserDocument;
    
    if (!user.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(config.get<number>('saltWorkFactor'));

    const hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;

    return next();
});

userSchema.methods.comparePassword = async function (
    candidate_password: string
): Promise<boolean> {
    const user = this as UserDocument;

    return bcrypt.compare(candidate_password, user.password).catch((e) => false);
}

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
