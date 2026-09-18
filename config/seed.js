import sequelize from "./sequelize_app.js";
import {Op} from "sequelize";
import {
    UserModel, CompanyModel, AgencyModel, ClientModel, EmployeeModel,
    ShipmentModel, ParcelModel, TrackingEventModel, PaymentModel,
    RouteModel, PriceModel, SubscriptionModel, CityModel,
    PlanModel, SubscriptionPaymentModel, InvoiceModel
} from "../src/model/index.js";
import {generateShipmentReference, generateTrackingNumber, generatePaymentReference, generateSubscriptionPaymentReference, generateReceiptNumber, generateInvoiceNumber} from "../src/helper/reference.js";
import {
    EMPLOYEE_ROLES, PARCEL_CATEGORIES, PARCEL_STATUSES, SUBSCRIPTION_PLANS,
    SHIPMENT_STATUSES, ROUTE_STATUSES, PAYMENT_METHODS, ROLES
} from "./app.js";

const CAMEROON_COMPANIES = [
    { name: 'Finexs Logistics Pro', city: 'Douala', address: 'Boulevard de la Liberté, Akwa', phone: '+237699001122', taxId: 'M051812345678A' },
    { name: 'Touristique Logistics Express', city: 'Yaoundé', address: 'Gare Voyageurs Mvan', phone: '+237677002233', taxId: 'M051812345678B' },
    { name: 'Buca Voyages Logistique', city: 'Yaoundé', address: 'Complexe Mvan, Yaoundé', phone: '+237699003344', taxId: 'M051812345678C' },
    { name: 'Général Express Interurbain', city: 'Douala', address: 'Rue Bepanda Marché, Douala', phone: '+237677004455', taxId: 'M051812345678D' },
    { name: 'Doves Logistics Express', city: 'Douala', address: 'Rue Joss, Bonanjo, Douala', phone: '+237699005566', taxId: 'M051812345678E' },
    { name: 'Danay Express Logistique', city: 'Maroua', address: 'Avenue de la République, Maroua', phone: '+237677006677', taxId: 'M051812345678F' },
    { name: 'Men Travel Logistics', city: 'Bafoussam', address: 'Carrefour Total, Bafoussam', phone: '+237699007788', taxId: 'M051812345678G' },
    { name: 'Transcam Fret & Colis', city: 'Ngaoundéré', address: 'Quartier Administratif, Ngaoundéré', phone: '+237677008899', taxId: 'M051812345678H' },
    { name: 'Océan Express Kribi', city: 'Kribi', address: 'Quartier Zikisso, Kribi', phone: '+237699009900', taxId: 'M051812345678I' },
    { name: 'Moghamo Express Courier', city: 'Bamenda', address: 'Commercial Avenue, Bamenda', phone: '+237677000011', taxId: 'M051812345678J' }
];

const CAMEROON_CITIES = [
    { name: 'Douala', region: 'Littoral' },
    { name: 'Yaoundé', region: 'Centre' },
    { name: 'Bafoussam', region: 'Ouest' },
    { name: 'Garoua', region: 'Nord' },
    { name: 'Bamenda', region: 'Nord-Ouest' },
    { name: 'Maroua', region: 'Extrême-Nord' },
    { name: 'Ngaoundéré', region: 'Adamaoua' },
    { name: 'Bertoua', region: 'Est' },
    { name: 'Kribi', region: 'Sud' },
    { name: 'Limbé', region: 'Sud-Ouest' }
];

const CAMEROON_AGENCIES_CONFIG = [
    // Finexs Logistics Pro
    [
        { name: 'Agence Douala Akwa', city: 'Douala', address: 'Boulevard de la Liberté, Akwa', manager: 'Paul Kamdem', region: 'Littoral', isPrimary: true },
        { name: 'Agence Yaoundé Mvan', city: 'Yaoundé', address: 'Complexe Mvan, Yaoundé', manager: 'Jeanne Atangana', region: 'Centre', isPrimary: false },
        { name: 'Agence Bafoussam Centre', city: 'Bafoussam', address: 'Rond-point Total, Bafoussam', manager: 'Alain Fotso', region: 'Ouest', isPrimary: false },
    ],
    // Touristique Express
    [
        { name: 'Agence Yaoundé Gare', city: 'Yaoundé', address: 'Face Gare Voyageurs Mvan', manager: 'Mamadou Ibrahim', region: 'Centre', isPrimary: true },
        { name: 'Agence Douala Bonabéri', city: 'Douala', address: 'Ancienne Route Bonabéri', manager: 'Gilles Tchoumi', region: 'Littoral', isPrimary: false },
        { name: 'Agence Garoua Centrale', city: 'Garoua', address: 'Boulevard Lamido, Garoua', manager: 'Ousmanou Bello', region: 'Nord', isPrimary: false },
    ],
    // Buca Voyages
    [
        { name: 'Agence Yaoundé Mvan', city: 'Yaoundé', address: 'Gare Buca Mvan', manager: 'Pierre Mbarga', region: 'Centre', isPrimary: true },
        { name: 'Agence Douala Bepanda', city: 'Douala', address: 'Carrefour Bepanda Omnisports', manager: 'Carine Ngo Bikoi', region: 'Littoral', isPrimary: false },
        { name: 'Agence Kribi Plage', city: 'Kribi', address: 'Avenue des Cocotiers, Kribi', manager: 'Jacques Ebanda', region: 'Sud', isPrimary: false },
    ],
    // Général Express
    [
        { name: 'Agence Douala Bepanda', city: 'Douala', address: 'Rue Bepanda Marché', manager: 'Samuel Njoya', region: 'Littoral', isPrimary: true },
        { name: 'Agence Yaoundé Bastos', city: 'Yaoundé', address: 'Descente Bastos, Yaoundé', manager: 'Marthe Safou', region: 'Centre', isPrimary: false },
        { name: 'Agence Bamenda Town', city: 'Bamenda', address: 'Commercial Avenue', manager: 'John Fru', region: 'Nord-Ouest', isPrimary: false },
    ],
    // Autres compagnies...
];

const FIRST_NAMES = ['Jean', 'Marie', 'Paul', 'Clarisse', 'Luc', 'Aline', 'Marc', 'Sophie', 'Éric', 'Nadia', 'Alain', 'Jeanne', 'Ibrahim', 'Samuel', 'Carine'];
const LAST_NAMES = ['Kamdem', 'Ngo Bikoi', 'Tchakounté', 'Fotso', 'Mbarga', 'Atangana', 'Njoya', 'Safou', 'Mballa', 'Epée', 'Mamadou', 'Ebanda', 'Bello', 'Tchoumi', 'Fru'];
const PRICE_CATEGORIES = ['standard', 'documents', 'vêtements', 'électronique', 'bagages', 'médicaments'];

const REALISTIC_PARCEL_DESCRIPTIONS = [
    'Carton de matériel informatique & téléphones',
    'Dossier administratif & passeports urgents',
    'Colis de vêtements & pagnes traditionnels',
    'Carton de pièces détachées automobiles',
    'Carton de médicaments et produits de santé',
    'Sacs de vivres frais & épices du marché',
    'Matériel électronique & accessoires photo',
    'Valise d\'effets personnels & documents'
];

/* ── Catalogue de plans (find-or-create par code) ── */
const PLAN_SEED = [
    { code: 'free', name: 'Gratuit', price: 0, maxAgencies: 1, maxUsers: 3, maxStorage: 0, maxShipments: 50, features: ['Gestion d\'agence', 'Suivi des colis', 'Rapports de base', 'Support par email'], description: 'Idéal pour découvrir la plateforme.' },
    { code: 'starter', name: 'Démarrage', price: 25000, maxAgencies: 2, maxUsers: 5, maxStorage: 1, maxShipments: 500, features: ['Gestion d\'agence', 'Suivi des colis', 'Rapports de base', 'Support par email'], description: 'Idéal pour les petites entreprises de livraison qui démarrent.' },
    { code: 'pro', name: 'Professionnel', price: 75000, maxAgencies: 10, maxUsers: 25, maxStorage: 5, maxShipments: -1, features: ['Gestion multi-agences', 'Suivi des colis avancé', 'Rapports détaillés', 'Support prioritaire', 'API d\'intégration', 'Gestion des employés'], description: 'Pour les entreprises en croissance avec plusieurs agences.' },
    { code: 'enterprise', name: 'Entreprise', price: 200000, maxAgencies: -1, maxUsers: -1, maxStorage: 50, maxShipments: -1, features: ['Agences illimitées', 'Utilisateurs illimités', 'Suivi en temps réel', 'Rapports personnalisés', 'Support dédié 24/7', 'API complète', 'Gestion avancée des employés', 'Multi-entreprise'], description: 'La solution complète pour les grandes entreprises de logistique.' }
];

const companySlugs = [];
const usedEmails = new Set();
const usedPhones = new Set();

const uniqueEmail = (prefix, i) => {
    let email = `seed.${prefix}${i}@seed.com`;
    while (usedEmails.has(email)) { i += 1; email = `seed.${prefix}${i}@seed.com`; }
    usedEmails.add(email);
    return email;
};

const uniquePhone = (i) => {
    let phone = `+23769${String(i).padStart(2, '0')}00000`.slice(0, 13);
    while (usedPhones.has(phone)) { i += 1; phone = `+23769${String(i).padStart(2, '0')}00000`.slice(0, 13); }
    usedPhones.add(phone);
    return phone;
};

const uniqueSlug = (base, i) => {
    let slug = `${base}-${i}`;
    while (companySlugs.includes(slug)) { i += 1; slug = `${base}-${i}`; }
    companySlugs.push(slug);
    return slug;
};

const nameOf = (offset) => `${FIRST_NAMES[offset % FIRST_NAMES.length]} ${LAST_NAMES[offset % LAST_NAMES.length]}`;

/* Progression d'événements de suivi selon le statut du colis */
const TRACKING_PATH_BY_PARCEL = {
    registered: ['registered'],
    preparing: ['registered', 'preparing'],
    in_transit: ['registered', 'in_transit'],
    arrived: ['registered', 'in_transit', 'arrived'],
    available_pickup: ['registered', 'in_transit', 'arrived', 'available_pickup'],
    collected: ['registered', 'in_transit', 'arrived', 'available_pickup', 'collected'],
    damaged: ['registered', 'damaged'],
    cancelled: ['registered', 'cancelled']
};
const TRACKING_DESCRIPTION = {
    registered: 'Colis enregistré et pris en charge au guichet',
    preparing: 'Colis vérifié, étiqueté et en préparation pour départ',
    in_transit: 'Colis chargé dans le bus/camion en transport interurbain',
    arrived: 'Colis réceptionné à l\'agence de destination',
    available_pickup: 'Colis disponible au guichet pour retrait par le destinataire',
    collected: 'Colis remis en main propre au destinataire contre présentation CNI',
    damaged: 'Colis signalé avec anomalie/emballage endommagé',
    cancelled: 'Expédition annulée'
};

/* Statut colis dérivé du statut expédition */
const PARCEL_STATUS_BY_SHIPMENT = {
    validated: 'registered',
    preparing: 'preparing',
    assigned: 'preparing',
    in_transit: 'in_transit',
    arrived: 'arrived',
    available_pickup: 'available_pickup',
    delivered: 'collected',
    cancelled: 'cancelled'
};

const transaction = await sequelize.transaction();

try {
    /* ── Cleanup du seed précédent (re-runnable) ── */
    const seedCompanies = await CompanyModel.findAll({
        where: { slug: { [Op.like]: 'seed-transport%' } },
        attributes: ['id'],
        transaction
    });
    const seedCompanyIds = seedCompanies.map((c) => c.id);

    if (seedCompanyIds.length) {
        const seedParcels = await ParcelModel.findAll({
            where: { companyId: { [Op.in]: seedCompanyIds } },
            attributes: ['id'],
            transaction
        });
        const seedParcelIds = seedParcels.map((p) => p.id);

        if (seedParcelIds.length) {
            await TrackingEventModel.destroy({ where: { parcelId: { [Op.in]: seedParcelIds } }, transaction });
        }
        await PaymentModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await ParcelModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await ShipmentModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await InvoiceModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await SubscriptionPaymentModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await SubscriptionModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await PriceModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await RouteModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await EmployeeModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await ClientModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await AgencyModel.destroy({ where: { companyId: { [Op.in]: seedCompanyIds } }, transaction });
        await CompanyModel.destroy({ where: { id: { [Op.in]: seedCompanyIds } }, transaction });
    }

    await UserModel.destroy({ where: { email: { [Op.like]: '%@seed.com' } }, transaction });

    /* ── Cities (10 Cameroun) — find-or-create ── */
    for (let i = 0; i < CAMEROON_CITIES.length; i += 1) {
        const c = CAMEROON_CITIES[i];
        const existing = await CityModel.findOne({
            where: { name: c.name, country: 'Cameroun' },
            transaction
        });
        if (!existing) {
            await CityModel.create({
                name: c.name, region: c.region, country: 'Cameroun', status: true
            }, { transaction });
        }
    }

    /* ── Plans (4) — find-or-create par code ── */
    const plans = [];
    for (let i = 0; i < PLAN_SEED.length; i += 1) {
        const data = PLAN_SEED[i];
        let plan = await PlanModel.findOne({ where: { code: data.code }, transaction });
        if (plan) {
            await plan.update({ ...data, id: plan.id }, { transaction });
        } else {
            plan = await PlanModel.create(data, { transaction });
        }
        plans.push(plan);
    }

    /* ── Companies (10 Camerounaises) ── */
    const companies = [];
    for (let i = 0; i < CAMEROON_COMPANIES.length; i += 1) {
        const cInfo = CAMEROON_COMPANIES[i];
        const company = await CompanyModel.create({
            name: cInfo.name,
            slug: uniqueSlug('seed-transport', i + 1),
            city: cInfo.city,
            address: cInfo.address,
            phone: cInfo.phone,
            email: `contact@${cInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.cm`,
            taxId: cInfo.taxId,
            status: 'active'
        }, { transaction });
        companies.push(company);
    }

    /* ── Agencies (30) — 3 par compagnie avec noms de quartiers réels ── */
    const agenciesByCompany = [];
    const agencyById = new Map();
    for (let c = 0; c < companies.length; c += 1) {
        const list = [];
        const presetAgencies = CAMEROON_AGENCIES_CONFIG[c] || [
            { name: `Agence ${CAMEROON_CITIES[c % 10].name} Centre`, city: CAMEROON_CITIES[c % 10].name, address: 'Rue Principale', manager: nameOf(c), region: CAMEROON_CITIES[c % 10].region, isPrimary: true },
            { name: `Agence ${CAMEROON_CITIES[(c + 1) % 10].name} Gare`, city: CAMEROON_CITIES[(c + 1) % 10].name, address: 'Gare Routière', manager: nameOf(c + 1), region: CAMEROON_CITIES[(c + 1) % 10].region, isPrimary: false },
            { name: `Agence ${CAMEROON_CITIES[(c + 2) % 10].name} Express`, city: CAMEROON_CITIES[(c + 2) % 10].name, address: 'Boulevard Commercial', manager: nameOf(c + 2), region: CAMEROON_CITIES[(c + 2) % 10].region, isPrimary: false }
        ];

        for (let a = 0; a < 3; a += 1) {
            const agInfo = presetAgencies[a];
            const agency = await AgencyModel.create({
                companyId: companies[c].id,
                name: agInfo.name,
                city: agInfo.city,
                address: agInfo.address,
                phone: `+237699${String(c)}${String(a)}1122`,
                email: `agence.${agInfo.city.toLowerCase()}@${companies[c].name.toLowerCase().replace(/[^a-z0-9]/g, '')}.cm`,
                manager: agInfo.manager,
                region: agInfo.region,
                isPrimary: agInfo.isPrimary,
                status: 'active'
            }, { transaction });
            list.push(agency);
            agencyById.set(agency.id, agency);
        }
        agenciesByCompany.push(list);
    }

    /* ── Users (10 utilisateurs rôles standard) ── */
    const users = [];
    for (let i = 0; i < 10; i += 1) {
        const user = await UserModel.create({
            lastname: LAST_NAMES[i % LAST_NAMES.length],
            firstname: FIRST_NAMES[i % FIRST_NAMES.length],
            gender: i % 2 === 0 ? 'M' : 'F',
            email: uniqueEmail('user', i),
            phone: `+23769911${String(i).padStart(2, '0')}00`,
            roles: 'user',
            status: true,
            verified: true,
            password: 'Seed@2026'
        }, { transaction });
        users.push(user);
    }

    /* ── Super Admin (ROLE_ROOT) ── */
    await UserModel.create({
        lastname: 'Système',
        firstname: 'SuperAdmin',
        gender: 'M',
        email: 'superadmin@seed.com',
        phone: '+237699000000',
        roles: ROLES.ROOT,
        status: true,
        verified: true,
        password: 'Seed@2026'
    }, { transaction });

    /* ── Clients (50) — 5 par compagnie ── */
    const clientsByCompany = [];
    let clientSeq = 0;
    for (let c = 0; c < 10; c += 1) {
        const list = [];
        for (let cl = 0; cl < 5; cl += 1) {
            const fn = FIRST_NAMES[(c + cl) % FIRST_NAMES.length];
            const ln = LAST_NAMES[(c + cl) % LAST_NAMES.length];
            const city = agenciesByCompany[c][cl % 3].city;
            const client = await ClientModel.create({
                userId: c < 5 && cl === 0 ? users[c].id : null,
                companyId: companies[c].id,
                clientCode: `CL-${String(clientSeq + 1).padStart(4, '0')}`,
                firstName: fn,
                lastName: ln,
                email: uniqueEmail('client', clientSeq),
                phone: `+237699${String(c)}${String(cl)}3344`,
                city: city,
                address: `${cl + 10} Rue du Marché, ${city}`,
                idType: (c + cl) % 2 === 0 ? 'cni' : 'passport',
                idNumber: `CNI-10${String(clientSeq + 1).padStart(7, '0')}`,
                preferredAgencyId: agenciesByCompany[c][cl % 3].id,
                status: 'active'
            }, { transaction });
            list.push(client);
            clientSeq += 1;
        }
        clientsByCompany.push(list);
    }

    /* ── Employees (50) — 5 par compagnie (Rôles opérationnels) ── */
    const regularRoles = ['depot_agent', 'retrait_agent', 'supervisor', 'accountant', 'delivery_driver'];
    const employeesByCompany = [];
    for (let c = 0; c < 10; c += 1) {
        const list = [];
        for (let e = 0; e < 5; e += 1) {
            // Create user account for depot_agent (e=0) and retrait_agent (e=1) for company 0
            let linkedUserId = null;
            if (c === 0 && e < 2) {
                const empUser = await UserModel.create({
                    lastname: e === 0 ? 'Tchakounté' : 'Ngo Bikoi',
                    firstname: e === 0 ? 'Jean (Agent Dépôt)' : 'Claire (Agent Retrait)',
                    gender: e === 0 ? 'M' : 'F',
                    email: `seed.emp${e}@seed.com`,
                    phone: `+23767700${String(e)}1122`,
                    roles: 'user',
                    status: true,
                    verified: true,
                    password: 'Seed@2026'
                }, { transaction });
                linkedUserId = empUser.id;
            } else if (c >= 5 && e === 0) {
                linkedUserId = users[c].id;
            }

            const employee = await EmployeeModel.create({
                userId: linkedUserId,
                companyId: companies[c].id,
                agencyId: agenciesByCompany[c][e % 3].id,
                firstName: e === 0 && c === 0 ? 'Jean' : e === 1 && c === 0 ? 'Claire' : FIRST_NAMES[(c + e + 3) % FIRST_NAMES.length],
                lastName: e === 0 && c === 0 ? 'Tchakounté' : e === 1 && c === 0 ? 'Ngo Bikoi' : LAST_NAMES[(c + e + 3) % LAST_NAMES.length],
                email: c === 0 && e < 2 ? `seed.emp${e}@seed.com` : uniqueEmail('emp', c * 5 + e),
                phone: `+237677${String(c)}${String(e)}4455`,
                role: regularRoles[e],
                status: 'active'
            }, { transaction });
            list.push(employee);
        }
        employeesByCompany.push(list);
    }

    /* ── Company Admins (10 managers) — seed.admin0@seed.com / Seed@2026 ── */
    for (let c = 0; c < 10; c += 1) {
        const adminUser = await UserModel.create({
            lastname: c === 0 ? 'Kamdem' : LAST_NAMES[c % LAST_NAMES.length],
            firstname: c === 0 ? 'Paul (DG Finexs)' : `Admin ${companies[c].name.split(' ')[0]}`,
            gender: c % 2 === 0 ? 'M' : 'F',
            email: `seed.admin${c}@seed.com`,
            phone: `+23769900${String(c)}7788`,
            roles: ROLES.ADMIN,
            status: true,
            verified: true,
            password: 'Seed@2026'
        }, { transaction });

        employeesByCompany[c].push(await EmployeeModel.create({
            userId: adminUser.id,
            companyId: companies[c].id,
            agencyId: agenciesByCompany[c][0].id,
            firstName: c === 0 ? 'Paul' : FIRST_NAMES[(c + 1) % FIRST_NAMES.length],
            lastName: c === 0 ? 'Kamdem' : LAST_NAMES[(c + 1) % LAST_NAMES.length],
            email: adminUser.email,
            phone: adminUser.phone,
            role: 'manager',
            status: 'active'
        }, { transaction }));
    }

    /* ── Routes (60) — 6 trajets interurbains par compagnie ── */
    for (let c = 0; c < 10; c += 1) {
        for (let r = 0; r < 6; r += 1) {
            const origin = agenciesByCompany[c][r % 3];
            const dest = agenciesByCompany[c][(r + 1) % 3];
            await RouteModel.create({
                companyId: companies[c].id,
                originAgencyId: origin.id,
                destinationAgencyId: dest.id,
                status: ROUTE_STATUSES[(c * 6 + r) % ROUTE_STATUSES.length],
                departureDate: new Date(Date.now() + r * 86400000),
                arrivalDate: new Date(Date.now() + (r + 2) * 86400000),
                vehicle: `Bus VIP ${origin.city.slice(0, 3)}-${dest.city.slice(0, 3)} #0${r + 1}`,
                driver: nameOf(c + r + 4),
                note: `Trajet régulier ${origin.name} ➔ ${dest.name}`
            }, { transaction });
        }
    }

    /* ── Prices (60) — Grille tarifaire en FCFA par catégorie ── */
    for (let c = 0; c < 10; c += 1) {
        for (let p = 0; p < 6; p += 1) {
            await PriceModel.create({
                companyId: companies[c].id,
                agencyId: agenciesByCompany[c][0].id,
                category: PRICE_CATEGORIES[p],
                unit: 'kg',
                ratePerKg: 1000 + p * 250, // 1000 FCFA à 2250 FCFA le kg
                minWeight: 1,
                maxWeight: 100,
                fixedFee: 500 + p * 200,
                status: 'active'
            }, { transaction });
        }
    }

    /* ── Subscriptions & Invoices (10) ── */
    const subscriptions = [];
    for (let i = 0; i < 10; i += 1) {
        const subscription = await SubscriptionModel.create({
            companyId: companies[i].id,
            plan: i === 0 ? 'enterprise' : i < 3 ? 'pro' : 'starter',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 86400000),
            autoRenew: true,
            status: 'active'
        }, { transaction });
        subscriptions.push(subscription);
    }

    for (let i = 0; i < subscriptions.length; i += 1) {
        const sub = subscriptions[i];
        const planPrice = PLAN_SEED.find((p) => p.code === sub.plan)?.price || 75000;
        for (let m = 0; m < 2; m += 1) {
            const reference = await generateSubscriptionPaymentReference(transaction);
            const receiptNumber = await generateReceiptNumber(transaction);
            const periodStart = new Date(Date.now() - (2 - m) * 30 * 86400000);
            const periodEnd = new Date(Date.now() - (1 - m) * 30 * 86400000);
            const payment = await SubscriptionPaymentModel.create({
                subscriptionId: sub.id,
                companyId: sub.companyId,
                reference,
                receiptNumber,
                amount: planPrice,
                currency: 'FCFA',
                paymentMethod: i % 2 === 0 ? 'mobile_money' : 'cash',
                status: 'paid',
                periodStart,
                periodEnd,
                paidAt: periodStart
            }, { transaction });

            const invoiceNumber = await generateInvoiceNumber(transaction);
            const taxAmount = Math.round(planPrice * 0.1925); // TVA Cameroun 19.25%
            await InvoiceModel.create({
                subscriptionId: sub.id,
                subscriptionPaymentId: payment.id,
                companyId: sub.companyId,
                invoiceNumber,
                amount: planPrice,
                taxRate: 0.1925,
                taxAmount,
                totalAmount: planPrice + taxAmount,
                status: 'paid',
                dueDate: periodEnd,
                paidAt: periodStart
            }, { transaction });
        }
    }

    /* ── Shipments (50) — 5 par compagnie ── */
    const shipments = [];
    for (let c = 0; c < 10; c += 1) {
        for (let s = 0; s < 5; s += 1) {
            const totalAmount = [8500, 12000, 15000, 22500, 35000][s];
            const paid = s !== 0; // La première est en attente, le reste payé
            const reference = await generateShipmentReference(transaction);
            const originAgency = agenciesByCompany[c][s % 3];
            const destAgency = agenciesByCompany[c][(s + 1) % 3];
            const senderClient = clientsByCompany[c][s % 5];
            const receiverClient = clientsByCompany[c][(s + 1) % 5];

            const shipment = await ShipmentModel.create({
                reference,
                clientId: senderClient.id,
                companyId: companies[c].id,
                agencyId: originAgency.id,
                destinationAgencyId: destAgency.id,
                agentId: employeesByCompany[c][0].id,
                origin: originAgency.city,
                destination: destAgency.city,
                sender: {
                    name: `${senderClient.firstName} ${senderClient.lastName}`,
                    phone: senderClient.phone,
                    city: originAgency.city,
                    address: senderClient.address
                },
                recipient: {
                    name: `${receiverClient.firstName} ${receiverClient.lastName}`,
                    phone: receiverClient.phone,
                    city: destAgency.city,
                    address: receiverClient.address
                },
                packageCount: 2,
                totalWeight: (s + 1) * 3.5,
                totalAmount,
                paidAmount: paid ? totalAmount : 0,
                paymentMethod: s % 2 === 0 ? 'mobile_money' : 'cash',
                paymentStatus: paid ? 'paid' : 'pending',
                status: SHIPMENT_STATUSES[s % SHIPMENT_STATUSES.length],
                note: `Envoi express ${originAgency.city} ➔ ${destAgency.city} (Marchandises)`,
                estimatedDeliveryDate: new Date(Date.now() + (s + 1) * 86400000)
            }, { transaction });
            shipments.push(shipment);
        }
    }

    /* ── Parcels (100) — 2 par expédition avec vraies catégories & descriptions ── */
    const parcels = [];
    for (let i = 0; i < shipments.length; i += 1) {
        const shipment = shipments[i];
        const parcelStatus = PARCEL_STATUS_BY_SHIPMENT[shipment.status] || 'registered';
        for (let p = 0; p < 2; p += 1) {
            const trackingNumber = await generateTrackingNumber(transaction);
            const parcel = await ParcelModel.create({
                trackingNumber,
                shipmentId: shipment.id,
                clientId: shipment.clientId,
                companyId: shipment.companyId,
                agencyId: shipment.agencyId,
                originAgencyId: shipment.agencyId,
                destinationAgencyId: shipment.destinationAgencyId,
                weight: Math.round((shipment.totalWeight / 2 + p * 0.5) * 10) / 10,
                dimensions: { length: 35 + p * 5, width: 25 + p * 5, height: 20 },
                category: PRICE_CATEGORIES[(i + p) % PRICE_CATEGORIES.length],
                description: REALISTIC_PARCEL_DESCRIPTIONS[(i + p) % REALISTIC_PARCEL_DESCRIPTIONS.length],
                declaredValue: (p + 1) * 50000,
                status: parcelStatus,
                origin: shipment.origin,
                destination: shipment.destination
            }, { transaction });
            parcels.push(parcel);
        }
    }

    /* ── Tracking Events (Événements de traçabilité réalistes) ── */
    for (let i = 0; i < parcels.length; i += 1) {
        const parcel = parcels[i];
        const c = Math.floor(i / 10);
        const path = TRACKING_PATH_BY_PARCEL[parcel.status] || ['registered'];
        const agent = employeesByCompany[c][i % 5];
        for (let k = 0; k < path.length; k += 1) {
            const stage = path[k];
            const atDest = ['arrived', 'available_pickup', 'collected'].includes(stage);
            const agency = agencyById.get(atDest ? parcel.destinationAgencyId : parcel.originAgencyId);
            await TrackingEventModel.create({
                parcelId: parcel.id,
                status: stage,
                location: agency ? `${agency.name} (${agency.city})` : `${parcel.origin} ➔ ${parcel.destination}`,
                description: TRACKING_DESCRIPTION[stage] || stage,
                agentName: agent ? `${agent.firstName} ${agent.lastName}` : 'Agent Guichet',
                date: new Date(Date.now() - (path.length - k) * 7200000)
            }, { transaction });
        }
    }

    /* ── Payments (50) — en FCFA avec historique ── */
    for (let i = 0; i < shipments.length; i += 1) {
        const shipment = shipments[i];
        const paid = shipment.paymentStatus === 'paid';
        const reference = await generatePaymentReference(transaction);
        await PaymentModel.create({
            reference,
            shipmentId: shipment.id,
            clientId: shipment.clientId,
            companyId: shipment.companyId,
            agencyId: shipment.agencyId,
            agentId: shipment.agentId,
            amount: shipment.totalAmount,
            method: shipment.paymentMethod,
            status: paid ? 'paid' : 'pending',
            transactionId: paid ? `MOMO-${Date.now().toString().slice(-6)}-${i + 1}` : null,
            history: paid
                ? [{ status: 'pending', date: new Date(Date.now() - 3600000) }, { status: 'paid', date: new Date() }]
                : [{ status: 'pending', date: new Date() }]
        }, { transaction });
    }

    await transaction.commit();
    console.log('\n=============================================================');
    console.log('🎉 SEED CAMEROUN RÉUSSI — JEU DE DONNÉES DE SOUTENANCE PRÊT ! 🎉');
    console.log('=============================================================');
    console.log('🏢 Entreprises réelles (10) :');
    console.log('   1. Finexs Logistics Pro (Douala Akwa, Yaoundé Mvan, Bafoussam)');
    console.log('   2. Touristique Logistics Express (Yaoundé, Douala, Garoua)');
    console.log('   3. Buca Voyages Logistique (Yaoundé, Douala, Kribi)');
    console.log('   4. Général Express Interurbain (Douala, Yaoundé, Bamenda)...');
    console.log('\n👥 COMPTES CLÉS POUR LA SOUTENANCE (Mot de passe unique: Seed@2026) :');
    console.log('   ⭐ Super Administrateur : superadmin@seed.com');
    console.log('   ⭐ DG / Admin Finexs    : seed.admin0@seed.com  (Paul Kamdem)');
    console.log('   ⭐ Agent Dépôt Douala   : seed.emp0@seed.com    (Jean Tchakounté - Agence Douala Akwa)');
    console.log('   ⭐ Agent Retrait Yaoundé: seed.emp1@seed.com    (Claire Ngo Bikoi - Agence Yaoundé Mvan)');
    console.log('   ⭐ Client Expéditeur    : seed.user0@seed.com');
    console.log('=============================================================\n');

} catch (error) {
    await transaction.rollback();
    console.error('❌ SEED FAILED:', error.message);
    process.exit(1);
} finally {
    await sequelize.close();
}
