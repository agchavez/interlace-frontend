export interface RoutePermissions {
    [url: string]: string[]
}

export const permisions = [
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
            "tracker.add_trackerdetailmodel",
            "tracker.add_trackerdetailoutputmodel",
            "tracker.add_trackerdetailproductmodel",
            "tracker.add_trackermodel",
            "tracker.add_typedetailoutputmodel",
            "tracker.change_trackerdetailmodel",
            "tracker.change_trackerdetailoutputmodel",
            "tracker.change_trackerdetailproductmodel",
            "tracker.change_trackermodel",
            "tracker.change_typedetailoutputmodel",
            "tracker.delete_trackerdetailmodel",
            "tracker.delete_trackerdetailoutputmodel",
            "tracker.delete_trackerdetailproductmodel",
            "tracker.delete_trackermodel",
            "tracker.view_trackerdetailmodel",
            "tracker.view_trackerdetailoutputmodel",
            "tracker.view_trackerdetailproductmodel",
            "tracker.view_trackermodel",
            "tracker.view_typedetailoutputmodel",
            "maintenance.view_distributorcenter",
            "maintenance.view_drivermodel",
            "maintenance.view_locationmodel",
            "maintenance.view_operatormodel",
            "maintenance.view_outputtypemodel",
            "maintenance.view_periodmodel",
            "maintenance.view_productmodel",
            "maintenance.view_routemodel",
            "maintenance.view_transportermodel",
            "maintenance.view_trailermodel",
            "maintenance.add_trailermodel",
        ]
    },
    {
        url: "/tracker/pallet-detail/:id",
        reg: /\/tracker\/pallet-detail\/\d+/,
        permissions: [
            "tracker.view_trackerdetailmodel",
            "tracker.view_trackerdetailoutputmodel",
            "tracker.view_trackerdetailproductmodel",
            "tracker.view_trackermodel",
            "tracker.view_typedetailoutputmodel",
            "maintenance.view_distributorcenter",
            "maintenance.view_drivermodel",
            "maintenance.view_locationmodel",
            "maintenance.view_operatormodel",
            "maintenance.view_outputtypemodel",
            "maintenance.view_periodmodel",
            "maintenance.view_productmodel",
            "maintenance.view_routemodel",
            "maintenance.view_transportermodel",
            "maintenance.view_trailermodel",
        ]
    },
    {
        url: "/tracker/detail/:id",
        reg: /\/tracker\/detail\/\d+/,
        permissions: [
            "any",
        ]
    },
    {
        url: "/tracker/check/:id",
        reg: /\/tracker\/check\/\d+/,
        permissions: [
            "tracker.view_trackerdetailmodel",
            "tracker.view_trackerdetailoutputmodel",
            "tracker.view_trackerdetailproductmodel",
            "tracker.view_trackermodel",
            "tracker.view_typedetailoutputmodel"
        ]
    },
    {
        url: "/tracker/manage",
        permissions: [
            "tracker.view_trackerdetailmodel",
            "tracker.view_trackerdetailoutputmodel",
            "tracker.view_trackerdetailproductmodel",
            "tracker.view_trackermodel",
            "tracker.view_typedetailoutputmodel"
        ]
    },
    {
        url: "/tracker/view",
        permissions: [
            "tracker.view_trackerdetailmodel",
            "tracker.view_trackerdetailoutputmodel",
            "tracker.view_trackerdetailproductmodel",
            "tracker.view_trackermodel",
            "tracker.view_typedetailoutputmodel"
        ]
    },
    {
        url: "/movimientos/crear",
        permissions: [
            "any"
        ]
    },
    {
        url: "/report/shift",
        permissions: [
            "tracker.view_trackerdetailproductmodel",
            "report.report_shift"
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
    directory[perm.url + '/'] = perm.permissions
})

export const RoutePermissionsDirectory = directory
