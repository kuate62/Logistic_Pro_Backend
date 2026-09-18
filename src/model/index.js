import UserModel from "./UserModel.js";
import CompanyModel from "./CompanyModel.js";
import AgencyModel from "./AgencyModel.js";
import ClientModel from "./ClientModel.js";
import EmployeeModel from "./EmployeeModel.js";
import ShipmentModel from "./ShipmentModel.js";
import ParcelModel from "./ParcelModel.js";
import TrackingEventModel from "./TrackingEventModel.js";
import PaymentModel from "./PaymentModel.js";
import RouteModel from "./RouteModel.js";
import PriceModel from "./PriceModel.js";
import SubscriptionModel from "./SubscriptionModel.js";
import CityModel from "./CityModel.js";
import PartnerRequestModel from "./PartnerRequestModel.js";
import PlanModel from "./PlanModel.js";
import SubscriptionPaymentModel from "./SubscriptionPaymentModel.js";
import InvoiceModel from "./InvoiceModel.js";
import NotificationModel from "./NotificationModel.js";

/* ── User ── */
UserModel.hasOne(ClientModel, { foreignKey: 'userId', as: 'clientProfile' })
ClientModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'account' })

UserModel.hasOne(EmployeeModel, { foreignKey: 'userId', as: 'employeeProfile' })
EmployeeModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'account' })

/* ── Company ── */
CompanyModel.hasMany(AgencyModel, { foreignKey: 'companyId', as: 'agencies' })
AgencyModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

CompanyModel.hasMany(ClientModel, { foreignKey: 'companyId', as: 'clients' })
ClientModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

CompanyModel.hasMany(EmployeeModel, { foreignKey: 'companyId', as: 'employees' })
EmployeeModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

CompanyModel.hasMany(ShipmentModel, { foreignKey: 'companyId', as: 'shipments' })
ShipmentModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

CompanyModel.hasMany(PaymentModel, { foreignKey: 'companyId', as: 'payments' })
PaymentModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

AgencyModel.hasMany(PaymentModel, { foreignKey: 'agencyId', as: 'payments' })
PaymentModel.belongsTo(AgencyModel, { foreignKey: 'agencyId', as: 'agency' })

CompanyModel.hasMany(PriceModel, { foreignKey: 'companyId', as: 'prices' })
PriceModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

CompanyModel.hasMany(SubscriptionModel, { foreignKey: 'companyId', as: 'subscriptions' })
SubscriptionModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

CompanyModel.hasMany(SubscriptionPaymentModel, { foreignKey: 'companyId', as: 'subscriptionPayments' })
SubscriptionPaymentModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

CompanyModel.hasMany(InvoiceModel, { foreignKey: 'companyId', as: 'invoices' })
InvoiceModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

CompanyModel.hasMany(RouteModel, { foreignKey: 'companyId', as: 'routes' })
RouteModel.belongsTo(CompanyModel, { foreignKey: 'companyId', as: 'company' })

/* ── Plan / Subscription / Billing ── */
PlanModel.hasMany(SubscriptionModel, { foreignKey: 'plan', sourceKey: 'code', as: 'subscriptions' })
SubscriptionModel.belongsTo(PlanModel, { foreignKey: 'plan', targetKey: 'code', as: 'planDetail' })

SubscriptionModel.hasMany(SubscriptionPaymentModel, { foreignKey: 'subscriptionId', as: 'subscriptionPayments' })
SubscriptionPaymentModel.belongsTo(SubscriptionModel, { foreignKey: 'subscriptionId', as: 'subscription' })

SubscriptionModel.hasMany(InvoiceModel, { foreignKey: 'subscriptionId', as: 'invoices' })
InvoiceModel.belongsTo(SubscriptionModel, { foreignKey: 'subscriptionId', as: 'subscription' })

SubscriptionPaymentModel.hasMany(InvoiceModel, { foreignKey: 'subscriptionPaymentId', as: 'invoices' })
InvoiceModel.belongsTo(SubscriptionPaymentModel, { foreignKey: 'subscriptionPaymentId', as: 'payment' })

/* ── Agency ── */
AgencyModel.hasMany(EmployeeModel, { foreignKey: 'agencyId', as: 'employees' })
EmployeeModel.belongsTo(AgencyModel, { foreignKey: 'agencyId', as: 'agency' })

AgencyModel.hasMany(ShipmentModel, { foreignKey: 'agencyId', as: 'originShipments' })
ShipmentModel.belongsTo(AgencyModel, { foreignKey: 'agencyId', as: 'originAgency' })

AgencyModel.hasMany(ShipmentModel, { foreignKey: 'destinationAgencyId', as: 'destinationShipments' })
ShipmentModel.belongsTo(AgencyModel, { foreignKey: 'destinationAgencyId', as: 'destinationAgency' })

AgencyModel.hasMany(RouteModel, { foreignKey: 'originAgencyId', as: 'originRoutes' })
RouteModel.belongsTo(AgencyModel, { foreignKey: 'originAgencyId', as: 'originAgency' })

AgencyModel.hasMany(RouteModel, { foreignKey: 'destinationAgencyId', as: 'destinationRoutes' })
RouteModel.belongsTo(AgencyModel, { foreignKey: 'destinationAgencyId', as: 'destinationAgency' })

AgencyModel.hasMany(PriceModel, { foreignKey: 'agencyId', as: 'prices' })
PriceModel.belongsTo(AgencyModel, { foreignKey: 'agencyId', as: 'agency' })

/* ── Client ── */
ClientModel.hasMany(ShipmentModel, { foreignKey: 'clientId', as: 'shipments' })
ShipmentModel.belongsTo(ClientModel, { foreignKey: 'clientId', as: 'client' })

AgencyModel.hasMany(ClientModel, { foreignKey: 'preferredAgencyId', as: 'preferredClients' })
ClientModel.belongsTo(AgencyModel, { foreignKey: 'preferredAgencyId', as: 'preferredAgency' })

ClientModel.hasMany(ParcelModel, { foreignKey: 'clientId', as: 'parcels' })
ParcelModel.belongsTo(ClientModel, { foreignKey: 'clientId', as: 'client' })

ClientModel.hasMany(PaymentModel, { foreignKey: 'clientId', as: 'payments' })
PaymentModel.belongsTo(ClientModel, { foreignKey: 'clientId', as: 'client' })

/* ── Employee ── */
EmployeeModel.hasMany(ShipmentModel, { foreignKey: 'agentId', as: 'handledShipments' })
ShipmentModel.belongsTo(EmployeeModel, { foreignKey: 'agentId', as: 'agent' })

EmployeeModel.hasMany(PaymentModel, { foreignKey: 'agentId', as: 'receivedPayments' })
PaymentModel.belongsTo(EmployeeModel, { foreignKey: 'agentId', as: 'agent' })

/* ── Shipment ── */
ShipmentModel.hasMany(ParcelModel, { foreignKey: 'shipmentId', as: 'parcels' })
ParcelModel.belongsTo(ShipmentModel, { foreignKey: 'shipmentId', as: 'shipment' })

ShipmentModel.hasMany(PaymentModel, { foreignKey: 'shipmentId', as: 'payments' })
PaymentModel.belongsTo(ShipmentModel, { foreignKey: 'shipmentId', as: 'shipment' })

RouteModel.hasMany(ShipmentModel, { foreignKey: 'routeId', as: 'shipments' })
ShipmentModel.belongsTo(RouteModel, { foreignKey: 'routeId', as: 'route' })

/* ── Parcel ── */
ParcelModel.hasMany(TrackingEventModel, { foreignKey: 'parcelId', as: 'tracking' })
TrackingEventModel.belongsTo(ParcelModel, { foreignKey: 'parcelId', as: 'parcel' })

export {
    UserModel,
    CompanyModel,
    AgencyModel,
    ClientModel,
    EmployeeModel,
    ShipmentModel,
    ParcelModel,
    TrackingEventModel,
    PaymentModel,
    RouteModel,
    PriceModel,
    SubscriptionModel,
    CityModel,
    PartnerRequestModel,
    PlanModel,
    SubscriptionPaymentModel,
    InvoiceModel,
    NotificationModel
}
