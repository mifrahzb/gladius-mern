export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
export const isStrongPassword = (pw) => pw && pw.length >= 6;
