import sequelize from "./sequelize_app.js";
import {
    UserModel, CompanyModel,
    AgencyModel, ClientModel,
    EmployeeModel, ShipmentModel,
    ParcelModel, TrackingEventModel,
    PaymentModel, RouteModel, PriceModel,
    SubscriptionModel, CityModel, PartnerRequestModel,
    PlanModel, SubscriptionPaymentModel, InvoiceModel,
    NotificationModel
} from "../src/model/index.js";

const models = [
    UserModel, CompanyModel, AgencyModel,
    ClientModel, EmployeeModel, ShipmentModel, ParcelModel,
    TrackingEventModel, PaymentModel, RouteModel, PriceModel,
    PlanModel, SubscriptionModel, SubscriptionPaymentModel,
    InvoiceModel, CityModel, PartnerRequestModel,
    NotificationModel
];

try {
    for (const model of models) {
        await model.sync({ alter: true });
    }
    console.log('✅ Database migration completed successfully.');
    process.exit(0);
} catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
}
