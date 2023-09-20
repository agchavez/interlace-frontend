export interface RoutePermissions {
    [url: string]: string[]
}

const permisions = [
    {
        url: "/user/register",
        permissions: [
            "user.add_usermodel",
            "user.change_usermodel"
        ]
    },
    {
        url: "/user",
        permissions: [
            "user.view_usermodel"
        ]
    },
    {
        url: "/tracker/check",
        permissions: [
            "maintenance.view_transportermodel",
            "maintenance.view_operatormodel",
            "maintenance.view_locationmodel",
            "maintenance.view_drivermodel",
            "maintenance.view_trailermodel",
            "maintenance.view_productmodel",
            "maintenance.view_distributorcenter",
        ]
    },
    {
        url: "/tracker/check/:id",
        permissions: [
            "maintenance.view_transportermodel",
            "maintenance.view_operatormodel",
            "maintenance.view_locationmodel",
            "maintenance.view_drivermodel",
            "maintenance.view_trailermodel",
            "maintenance.view_productmodel",
            "maintenance.view_distributorcenter",
        ]
    },
    {
        url: "/tracker/manage",
        permissions: [
            "maintenance.view_transportermodel",
            "maintenance.view_operatormodel",
            "maintenance.view_locationmodel",
            "maintenance.view_drivermodel",
            "maintenance.view_trailermodel",
            "maintenance.view_productmodel",
            "maintenance.view_distributorcenter",
        ]
    },
    {
        url: "/movimientos/crear",
        permissions: [
            "any"
        ]
    },
    {
        url: "/auth/login",
        permissions: [
            "any"
        ]
    },
    {
        url: "",
        permissions: [
            "any"
        ]
    },
]

const directory: RoutePermissions = {}

permisions.forEach(perm => {
    directory[perm.url] = perm.permissions
    directory[perm.url+'/'] = perm.permissions
})

export const RoutePermissionsDirectory = directory
