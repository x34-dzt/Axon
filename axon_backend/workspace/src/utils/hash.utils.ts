import bcrypt from "bcryptjs";

/*
	FUNCTIONS TO HASH THE PASSWORD AND CHECK THE HASHED PASSWORD
*/

export const hashPassword = async (password: string): Promise<string> => {
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		return hashedPassword;
	} catch (error) {
		throw new Error("Error hashing password");
	}
};

export const checkHashPassword = async (
	password: string,
	hashPassword: string,
): Promise<boolean> => {
	try {
		return await bcrypt.compare(password, hashPassword);
	} catch (error) {
		throw new Error(
			"Error matching the hash password with the un-hashed password",
		);
	}
};
