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
            "tracker.view_typedetailoutputmodel"
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
            "tracker.view_typedetailoutputmodel",
        ]
    },
    {
        url: "/movimientos/crear",
        permissions: [
            "report.report_tracker",
        ]
    },
    {
        url: "/tracker/export",
        permissions: [
            "report.report_shift",
        ]
    },
    {
        url: "/report/shift",
        permissions: [
            "tracker.view_trackerdetailproductmodel",
            "report.report_shift",
        ]
    },
    {
        url: "/order/manage",
        permissions: [
            "order.view_ordermodel",
        ]
    },
    {
        url: "/order/register",
        permissions: [
            "order.add_ordermodel",
        ]
    },
    {
        url: "/report/por-expirar",
        permissions: [
            "tracker.view_trackerdetailproductmodel",
            "report.report_risk_stock_ege"
        ]
    },
    {
        url: "/inventory",
        permissions: [
            'any',
        ]
    },
    {
        url: "/auth/login",
        permissions: [
            "any"
        ]
    },
    {
        url: "/tracker-t2/pre-sale",
        permissions: [
            "tracker.add_outputt2model"
        ]
    },
    {
        url: "/tracker-t2/pre-sale-check",
        permissions: [
            "tracker.view_outputt2model",
            "tracker.change_outputdetailt2model",
            "tracker.add_trackeroutputt2model",
            "tracker.change_trackeroutputt2model",
            "tracker.view_trackeroutputt2model",
            "tracker.delete_trackeroutputt2model",
        ]
    },
    {
        url: "/tracker-t2/manage",
        permissions: [
            "tracker.view_outputt2model",
        ]
    },
    {
        url: "/tracker-t2/detail/:id",
        reg: /\/tracker-t2\/detail\/\d+/,
        permissions: [
            "tracker.view_outputt2model",
        ]
    },
    {
        url: "/tracker-t2/simulated/:id",
        reg: /\/tracker-t2\/simulated\/\d+/,
        permissions: [
            "tracker.view_outputt2model",
        ]
    },
    {
        url: "",
        permissions: [
            "any"
        ]
    },
    {
        url: "/dashboard/cd",
        permissions: [
            "cd.more",
        ]
    },
    {
        url:"/claim",
        permissions: [
            "imported.view_claimmodel",
            "imported.change_status_claimmodel"
        ]
    },
    {
        url:"/claim/detail/:id",
        reg: /\/claim\/detail\/\d+/,
        permissions: [
            "imported.view_claimmodel"
        ]
    },

    {
        url:"/claim/editstatus/:id",
        reg: /\/claim\/editstatus\/\d+/,
        permissions: [
            "imported.view_claimmodel",
            "imported.change_status_claimmodel"
        ]
    },
    {
        url:"/claim/mine",
        permissions: [
            "imported.view_claimmodel"
        ]
    },
    {
        url:"/notifications",
        permissions: [
            "any"
        ]
    },
    {
        url:"/maintenance/distributor-center",
        permissions: [
            "maintenance.view_distributorcenter"
        ]
    },
    {
        url: "/maintenance/period-center",
        permissions: [
            "maintenance.view_periodmodel"
        ]
    },
    {
        url: "/maintenance/metric-types",
        permissions: [
            "personnel.manage_personnel"
        ]
    },
    {
        url: "/personnel/my-profile",
        permissions: [
            "any"
        ]
    },
    {
        url: "/personnel",
        permissions: [
            "personnel.view_personnelprofile"
        ]
    },
    {
        url: "/personnel/dashboard",
        permissions: [
            "personnel.view_personnelprofile"
        ]
    },
    {
        url: "/personnel/create",
        permissions: [
            "personnel.add_personnelprofile"
        ]
    },
    {
        url: "/personnel/detail/:id",
        reg: /\/personnel\/detail\/\d+/,
        permissions: [
            "personnel.view_personnelprofile"
        ]
    },
    {
        url: "/personnel/edit/:id",
        reg: /\/personnel\/edit\/\d+/,
        permissions: [
            "personnel.change_personnelprofile"
        ]
    },
    {
        url: "/personnel/my-profile/edit",
        permissions: [
            "any"
        ]
    },
    {
        url: "/personnel/certifications",
        permissions: [
            "personnel.view_certification"
        ]
    },
    {
        url: "/personnel/certifications/create",
        permissions: [
            "personnel.add_certification"
        ]
    },
    {
        url: "/personnel/certifications/:id",
        reg: /\/personnel\/certifications\/\d+/,
        permissions: [
            "personnel.view_certification"
        ]
    },
    {
        url: "/personnel/performance",
        permissions: [
            "personnel.view_performancemetric"
        ]
    },
    {
        url: "/personnel/performance/create",
        permissions: [
            "personnel.add_performancemetric"
        ]
    },
    {
        url: "/personnel/management",
        permissions: [
            "personnel.view_personnelprofile"
        ]
    },
    {
        url: "/demo-v2",
        permissions: [
            "any"
        ]
    },
    // Tokens
    {
        url: "/tokens",
        permissions: [
            "tokens.view_tokenrequest"
        ]
    },
    {
        url: "/tokens/create",
        permissions: [
            "tokens.add_tokenrequest"
        ]
    },
    {
        url: "/tokens/detail/:id",
        reg: /\/tokens\/detail\/\d+/,
        permissions: [
            "tokens.view_tokenrequest"
        ]
    },
    {
        url: "/tokens/pending",
        permissions: [
            "tokens.view_tokenrequest"
        ]
    },
    {
        url: "/tokens/validate",
        permissions: [
            "tokens.view_tokenrequest"
        ]
    },
    {
        url: "/tokens/:id/complete-delivery",
        reg: /\/tokens\/\d+\/complete-delivery/,
        permissions: [
            "tokens.view_tokenrequest"
        ]
    },
    {
        url: "/public/token/:uuid",
        reg: /\/public\/token\/[a-f0-9-]+/,
        permissions: [
            "any"
        ]
    },
    // Token Catalogs / Maintenance
    {
        url: "/tokens/materials",
        permissions: [
            "tokens.view_material"
        ]
    },
    {
        url: "/tokens/external-persons",
        permissions: [
            "tokens.view_externalperson"
        ]
    },
    // Maintenance - Products
    {
        url: "/maintenance/products",
        permissions: [
            "maintenance.view_productmodel"
        ]
    }
]

const directory: RoutePermissions = {}

permisions.forEach(perm => {
    directory[perm.url] = perm.permissions
    directory[perm.url + '/'] = perm.permissions
})

export const RoutePermissionsDirectory = directory
