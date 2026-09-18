
export const ROLES = {
    ADMIN: "ROLE_ADMIN",
    USER: "ROLE_USER",
    ROOT: "ROLE_ROOT"
}

export const COMPANY_STATUSES = ['active', 'suspended', 'inactive']

export const AGENCY_STATUSES = ['active', 'inactive', 'closed']

export const CLIENT_STATUSES = ['active', 'inactive', 'blocked']

export const EMPLOYEE_STATUSES = ['active', 'inactive', 'suspended']

export const EMPLOYEE_ROLES = ['depot_agent', 'retrait_agent', 'manager', 'supervisor', 'accountant', 'delivery_driver']

export const SHIPMENT_STATUSES = ['validated', 'preparing', 'assigned', 'in_transit', 'arrived', 'available_pickup', 'delivered', 'cancelled']

export const PARCEL_STATUSES = ['registered', 'preparing', 'in_transit', 'arrived', 'available_pickup', 'collected', 'damaged', 'cancelled']

export const PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed']

export const PAYMENT_METHODS = ['cash', 'mobile_money', 'bank_transfer', 'card']

export const PARCEL_CATEGORIES = ['standard', 'électronique', 'documents', 'alimentation', 'vêtements', 'bagages', 'médicaments']

export const ROUTE_STATUSES = ['planned', 'open', 'loading', 'ready', 'in_transit', 'arrived', 'completed', 'cancelled', 'suspended']

export const SUBSCRIPTION_PLANS = ['free', 'starter', 'pro', 'enterprise']
