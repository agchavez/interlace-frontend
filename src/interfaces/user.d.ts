export interface RegisterUserForm {
    fistName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    group: string;
    cd?: string;
}