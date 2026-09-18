import sequelize from "../../config/sequelize_app.js";
import {Op, Sequelize} from "sequelize";
import ShipmentModel from "../model/ShipmentModel.js";
import ParcelModel from "../model/ParcelModel.js";
import TrackingEventModel from "../model/TrackingEventModel.js";
import PaymentModel from "../model/PaymentModel.js";
import ClientModel from "../model/ClientModel.js";
import CompanyModel from "../model/CompanyModel.js";
import AgencyModel from "../model/AgencyModel.js";
import EmployeeModel from "../model/EmployeeModel.js";
import RouteModel from "../model/RouteModel.js";
import {generateShipmentReference, generateTrackingNumber} from "../helper/reference.js";
import {sendTemplateEmail} from "../helper/sendMail.js";
import {trackingQuerySchema} from "../schema/shipmentSchema.js";

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

const shipmentIncludes = (parcels = true, payments = true) => {
    const include = [
        { model: ClientModel, as: 'client' },
        { model: CompanyModel, as: 'company' },
        { model: AgencyModel, as: 'originAgency' },
        { model: AgencyModel, as: 'destinationAgency' },
        { model: RouteModel, as: 'route' }
    ];
    if (parcels) include.push({ model: ParcelModel, as: 'parcels' });
    if (payments) include.push({ model: PaymentModel, as: 'payments' });
    return include;
};

export const createShipment = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const body = req.body;

        const client = await ClientModel.findByPk(body.clientId);
        if (!client) return res.status(400).json({ message: 'Client introuvable' });

        const company = await CompanyModel.findByPk(body.companyId);
        if (!company) return res.status(400).json({ message: 'Compagnie introuvable' });

        const agency = await AgencyModel.findByPk(body.agencyId);
        if (!agency) return res.status(400).json({ message: "Agence d'origine introuvable" });

        let destinationAgency = null;
        if (body.destinationAgencyId) {
            destinationAgency = await AgencyModel.findByPk(body.destinationAgencyId);
            if (!destinationAgency) return res.status(400).json({ message: 'Agence de destination introuvable' });
        }

        let route = null;
        if (body.routeId) {
            route = await RouteModel.findByPk(body.routeId);
            if (!route) return res.status(400).json({ message: 'Trajet introuvable' });
        }

        const reference = await generateShipmentReference(transaction);

        const totalWeight = Math.round(
            body.parcels.reduce((sum, p) => sum + (p.weight || 0), 0) * 10
        ) / 10;

        let estimatedDeliveryDate = body.estimatedDeliveryDate || null;
        if (!estimatedDeliveryDate && route && route.estimatedDuration) {
            estimatedDeliveryDate = new Date(Date.now() + route.estimatedDuration * 60 * 60 * 1000);
        }

        const shipment = await ShipmentModel.create({
            reference,
            clientId: body.clientId,
            companyId: body.companyId,
            agencyId: body.agencyId,
            destinationAgencyId: body.destinationAgencyId || null,
            routeId: body.routeId || null,
            agentId: body.agentId || null,
            origin: body.origin,
            destination: body.destination,
            sender: body.sender || null,
            recipient: body.recipient || null,
            packageCount: body.parcels.length,
            totalWeight,
            totalAmount: body.totalAmount,
            paidAmount: body.paidAmount || 0,
            paymentMethod: body.paymentMethod || null,
            paymentStatus: body.paidAmount && body.paidAmount >= body.totalAmount ? 'paid' : 'pending',
            status: 'validated',
            note: body.note || null,
            estimatedDeliveryDate
        }, { transaction });

        const parcels = [];
        for (const parcelData of body.parcels) {
            const trackingNumber = await generateTrackingNumber(transaction);
            const parcel = await ParcelModel.create({
                trackingNumber,
                shipmentId: shipment.id,
                clientId: body.clientId,
                companyId: body.companyId,
                agencyId: body.agencyId,
                originAgencyId: body.agencyId,
                destinationAgencyId: body.destinationAgencyId || null,
                weight: parcelData.weight || 0,
                dimensions: parcelData.dimensions || null,
                category: parcelData.category || 'standard',
                description: parcelData.description || null,
                declaredValue: parcelData.declaredValue || 0,
                status: 'registered',
                origin: body.origin,
                destination: body.destination
            }, { transaction });

            await TrackingEventModel.create({
                parcelId: parcel.id,
                status: 'validated',
                location: agency ? `${agency.name}, ${agency.city}` : body.origin,
                description: 'Colis enregistré et pris en charge',
                agentName: req.user ? `${req.user.firstname ?? ''} ${req.user.lastname ?? ''}`.trim() || null : null,
                date: new Date()
            }, { transaction });

            parcels.push(parcel);
        }

        await transaction.commit();

        try {
            if (client.email) {
                await sendTemplateEmail(
                    client.email,
                    'Expédition créée',
                    'shipmentCreated',
                    {
                        reference,
                        trackingNumber: parcels[0]?.trackingNumber,
                        origin: body.origin,
                        destination: body.destination,
                        totalAmount: body.totalAmount
                    }
                );
            }
        }
        catch (e) {
            console.log(e.message)
        }

        return res.status(201).json({
            shipment: await ShipmentModel.findByPk(shipment.id, {
                include: shipmentIncludes()
            }),
            message: `Expédition ${reference} créée avec succès`
        });
    }
    catch (error) {
        await transaction.rollback();
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getShipments = async (req, res) => {
    try {
        const { status, companyId, agencyId, clientId, routeId, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (companyId) where.companyId = companyId;
        if (agencyId) where.agencyId = agencyId;
        if (clientId) where.clientId = clientId;
        if (routeId) where.routeId = routeId;

        const offset = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);

        const { rows, count } = await ShipmentModel.findAndCountAll({
            where,
            include: shipmentIncludes(),
            order: [['createdAt', 'DESC']],
            limit: Math.max(parseInt(limit, 10), 1),
            offset,
            distinct: true
        });

        return res.status(200).json({
            shipments: rows,
            total: count,
            page: Math.max(parseInt(page, 10), 1),
            limit: Math.max(parseInt(limit, 10), 1)
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getShipment = async (req, res) => {
    try {
        const shipment = await ShipmentModel.findByPk(req.params.id, {
            include: shipmentIncludes()
        });

        if (!shipment) return res.status(404).json({ message: 'Expédition introuvable' });

        return res.status(200).json({ shipment });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateShipment = async (req, res) => {
    try {
        const shipment = await ShipmentModel.findByPk(req.params.id);
        if (!shipment) return res.status(404).json({ message: 'Expédition introuvable' });

        if (req.body.destinationAgencyId) {
            const agency = await AgencyModel.findByPk(req.body.destinationAgencyId);
            if (!agency) return res.status(400).json({ message: 'Agence de destination introuvable' });
        }

        if (req.body.agentId) {
            const employee = await EmployeeModel.findByPk(req.body.agentId);
            if (!employee) return res.status(400).json({ message: 'Employé introuvable' });
        }

        await shipment.update(req.body);

        return res.status(200).json({
            shipment: await ShipmentModel.findByPk(shipment.id, { include: shipmentIncludes() }),
            message: 'Expédition mise à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteShipment = async (req, res) => {
    try {
        const shipment = await ShipmentModel.findByPk(req.params.id);
        if (!shipment) return res.status(404).json({ message: 'Expédition introuvable' });

        const [parcels, payments] = await Promise.all([
            ParcelModel.count({ where: { shipmentId: shipment.id } }),
            PaymentModel.count({ where: { shipmentId: shipment.id } })
        ]);

        const total = parcels + payments;
        if (total > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer : l'expédition possède ${total} élément(s) lié(s) (colis, paiements).`
            });
        }

        await shipment.destroy();

        return res.status(200).json({ message: 'Expédition supprimée' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getShipmentHistory = async (req, res) => {
    try {
        const shipment = await ShipmentModel.findByPk(req.params.id, {
            include: [{ model: ParcelModel, as: 'parcels' }]
        });
        if (!shipment) return res.status(404).json({ message: 'Expédition introuvable' });

        const parcelIds = shipment.parcels.map((p) => p.id);

        const events = parcelIds.length > 0
            ? await TrackingEventModel.findAll({
                where: { parcelId: { [Op.in]: parcelIds } },
                order: [['date', 'DESC']]
            })
            : [];

        return res.status(200).json({ events });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getShipmentStats = async (req, res) => {
    try {
        const { companyId, agencyId, clientId } = req.query;

        const where = {};
        if (companyId) where.companyId = companyId;
        if (agencyId) where.agencyId = agencyId;
        if (clientId) where.clientId = clientId;

        const [total, byStatus, aggregations] = await Promise.all([
            ShipmentModel.count({ where }),
            ShipmentModel.findAll({
                where,
                attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                group: ['status'],
                raw: true
            }),
            ShipmentModel.findAll({
                where,
                attributes: [
                    [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalRevenue'],
                    [Sequelize.fn('SUM', Sequelize.col('paidAmount')), 'totalPaid'],
                    [Sequelize.fn('SUM', Sequelize.col('packageCount')), 'totalPackages'],
                    [Sequelize.fn('SUM', Sequelize.col('totalWeight')), 'totalWeight']
                ],
                raw: true
            })
        ]);

        const statusCounts = {};
        for (const row of byStatus) statusCounts[row.status] = Number(row.count);

        const agg = aggregations[0] || {};

        return res.status(200).json({
            stats: {
                total,
                ...statusCounts,
                totalRevenue: Number(agg.totalRevenue) || 0,
                totalPaid: Number(agg.totalPaid) || 0,
                totalPackages: Number(agg.totalPackages) || 0,
                totalWeight: Number(agg.totalWeight) || 0
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateShipmentStatus = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const shipment = await ShipmentModel.findByPk(req.params.id, { transaction });
        if (!shipment) return res.status(404).json({ message: 'Expédition introuvable' });

        if (shipment.status === 'cancelled' || shipment.status === 'delivered') {
            return res.status(400).json({ message: `Impossible de changer le statut d'une expédition ${shipment.status}` });
        }

        const previousStatus = shipment.status;
        const newStatus = req.body.status;

        await shipment.update({ status: newStatus }, { transaction });

        if (previousStatus !== newStatus) {
            const parcelStatus = PARCEL_STATUS_BY_SHIPMENT[newStatus];
            if (parcelStatus) {
                const parcels = await ParcelModel.findAll({ where: { shipmentId: shipment.id }, transaction });

                for (const parcel of parcels) {
                    await parcel.update({ status: parcelStatus }, { transaction });

                    await TrackingEventModel.create({
                        parcelId: parcel.id,
                        status: newStatus,
                        location: newStatus === 'arrived' || newStatus === 'available_pickup'
                            ? (shipment.destination || '')
                            : (shipment.origin || ''),
                        description: `Expédition ${newStatus === 'delivered' ? 'livrée et colis récupéré' : 'passée au statut ' + newStatus}`,
                        date: new Date()
                    }, { transaction });
                }
            }
        }

        await transaction.commit();

        return res.status(200).json({
            shipment: await ShipmentModel.findByPk(shipment.id, {
                include: shipmentIncludes()
            }),
            message: `Statut de l'expédition mis à jour`
        });
    }
    catch (error) {
        await transaction.rollback();
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getParcelTracking = async (req, res) => {
    try {
        const { error, value } = trackingQuerySchema.validate(req.query, {
            abortEarly: true,
            stripUnknown: true
        });

        if (error) return res.status(400).json({ message: error.details[0].message });

        const parcel = await ParcelModel.findOne({
            where: { trackingNumber: value.trackingNumber },
            include: [
                {
                    model: TrackingEventModel,
                    as: 'tracking',
                    order: [['date', 'DESC']]
                }
            ]
        });

        if (!parcel) return res.status(404).json({ message: 'Colis introuvable' });

        return res.status(200).json({ parcel });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
