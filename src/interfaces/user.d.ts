export interface RegisterUserForm {
    fistName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    group: string;
    cd?: string;
}


export type UserResponse = {
    count?:    number;
    next?:     string;
    previous?: string;
    results?:  User[];
}

export type User = {
    id?:                 number;
    listGroups?:         string[];
    listPermissions?:    string[];
    centroDistribucion?: null;
    lastLogin?:          Date;
    isSuperuser?:        boolean;
    username?:           string;
    isStaff?:            boolean;
    isActive?:           boolean;
    dateJoined?:         Date;
    firstName?:          string;
    lastName?:           string;
    email?:              string;
    codigoEmpleado?:     null;
    createdAt?:          Date;
    groups?:             string[];
    userPermissions?:    string[];
}

export interface UserQuerySearch {
    limit?: number;
    offset?: number;
    search?: string;
}
