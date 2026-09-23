import './env.js';
import { UserModel, CompanyModel, AgencyModel, PlanModel, CityModel } from '../src/model/index.js';
import sequelize from './sequelize_app.js';

const log = (msg) => console.log(msg);
const PASS = 'Seed@2026'; // le hook beforeCreate hashera automatiquement

async function run() {
    log('🔌 Connexion...'); await sequelize.authenticate(); log('✅ Connecté !');

    log('\n📦 Plans...');
    await PlanModel.bulkCreate([
        { code: 'free', name: 'Gratuit', price: 0, maxAgencies: 1, maxUsers: 3, maxStorage: 0, maxShipments: 50, features: JSON.stringify(['Gestion agence']), description: 'Découverte.' },
        { code: 'starter', name: 'Démarrage', price: 25000, maxAgencies: 2, maxUsers: 5, maxStorage: 1, maxShipments: 500, features: JSON.stringify(['Gestion agence']), description: 'Petites entreprises.' },
        { code: 'pro', name: 'Professionnel', price: 75000, maxAgencies: 10, maxUsers: 25, maxStorage: 5, maxShipments: -1, features: JSON.stringify(['Multi-agences']), description: 'Croissance.' },
        { code: 'enterprise', name: 'Entreprise', price: 200000, maxAgencies: -1, maxUsers: -1, maxStorage: 50, maxShipments: -1, features: JSON.stringify(['Illimité']), description: 'Complète.' }
    ], { ignoreDuplicates: true });
    log('   ✅ Plans OK');

    log('\n🏙️  Villes...');
    await CityModel.bulkCreate([
        { name: 'Douala', region: 'Littoral' }, { name: 'Yaoundé', region: 'Centre' },
        { name: 'Bafoussam', region: 'Ouest' }, { name: 'Garoua', region: 'Nord' },
        { name: 'Bamenda', region: 'Nord-Ouest' }, { name: 'Maroua', region: 'Extrême-Nord' },
        { name: 'Ngaoundéré', region: 'Adamaoua' }, { name: 'Bertoua', region: 'Est' },
        { name: 'Kribi', region: 'Sud' }, { name: 'Limbé', region: 'Sud-Ouest' }
    ], { ignoreDuplicates: true });
    log('   ✅ Villes OK');

    // Supprimer l'ancien super admin mal haché s'il existe
    await UserModel.destroy({ where: { email: 'superadmin@seed.com' } });
    await UserModel.destroy({ where: { email: 'seed.admin0@seed.com' } });
    await UserModel.destroy({ where: { email: 'seed.emp0@seed.com' } });
    await UserModel.destroy({ where: { email: 'seed.user0@seed.com' } });
    log('\n🧹 Anciens comptes supprimés');

    log('\n👤 Création des comptes (mot de passe en clair — hook hashera)...');
    await UserModel.create({ email: 'superadmin@seed.com', password: PASS, firstname: 'Super', lastname: 'Admin', phone: '+237699000001', roles: 'super_admin', status: true, verified: true });
    log('   ✅ superadmin@seed.com');

    log('\n🏢 Entreprise demo...');
    const [company] = await CompanyModel.findOrCreate({ where: { slug: 'finexs-logistics-demo' }, defaults: { name: 'Finexs Logistics Pro', slug: 'finexs-logistics-demo', address: 'Boulevard de la Liberté, Akwa', city: 'Douala', phone: '+237699001122', email: 'contact@finexs.cm', taxId: 'M051812345678A' } });
    log('   ✅ Entreprise id=' + company.id);

    log('\n🏪 Agence...');
    const [agency] = await AgencyModel.findOrCreate({ where: { companyId: company.id, name: 'Agence Douala Akwa' }, defaults: { name: 'Agence Douala Akwa', companyId: company.id, address: 'Boulevard de la Liberté, Akwa', city: 'Douala', phone: '+237699001122', manager: 'Paul Kamdem', region: 'Littoral', isPrimary: true } });
    log('   ✅ Agence id=' + agency.id);

    await UserModel.create({ email: 'seed.admin0@seed.com', password: PASS, firstname: 'Paul', lastname: 'Kamdem', phone: '+237699001123', roles: 'admin', status: true, verified: true });
    log('   ✅ seed.admin0@seed.com');

    await UserModel.create({ email: 'seed.emp0@seed.com', password: PASS, firstname: 'Jean', lastname: 'Tchakoute', phone: '+237699001124', roles: 'employee', status: true, verified: true });
    log('   ✅ seed.emp0@seed.com');

    await UserModel.create({ email: 'seed.user0@seed.com', password: PASS, firstname: 'Marie', lastname: 'Ngo Bikoi', phone: '+237699001125', roles: 'user', status: true, verified: true });
    log('   ✅ seed.user0@seed.com');

    log('\n🎉 SEED TERMINÉ ! Mot de passe : Seed@2026');
    log('   superadmin@seed.com | seed.admin0@seed.com | seed.emp0@seed.com | seed.user0@seed.com');
    await sequelize.close(); process.exit(0);
}
run().catch(async (err) => { console.error('❌ FAILED:', err.message); await sequelize.close().catch(()=>{}); process.exit(1); });
