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
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.sync({ alter: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Database migration completed successfully.');
    process.exit(0);
} catch (error) {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;').catch(() => {});
    console.error('❌ Database migration failed:', error);
    process.exit(1);
}
