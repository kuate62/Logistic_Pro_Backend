import {Op} from 'sequelize';
import sequelize from "../../config/sequelize_app.js";
import ParcelModel from "../model/ParcelModel.js";
import TrackingEventModel from "../model/TrackingEventModel.js";
import ShipmentModel from "../model/ShipmentModel.js";
import PaymentModel from "../model/PaymentModel.js";
import ClientModel from "../model/ClientModel.js";
import CompanyModel from "../model/CompanyModel.js";
import AgencyModel from "../model/AgencyModel.js";
import {parcelQuerySchema} from "../schema/parcelSchema.js";

const parcelIncludes = () => [
    {
        model: ShipmentModel,
        as: 'shipment',
        include: [
            { model: ClientModel, as: 'client' },
            { model: CompanyModel, as: 'company' },
            { model: AgencyModel, as: 'originAgency' },
            { model: AgencyModel, as: 'destinationAgency' }
        ]
    },
    {
        model: TrackingEventModel,
        as: 'tracking',
        order: [['date', 'DESC']]
    }
];

export const getParcels = async (req, res) => {
    try {
        const { error, value } = parcelQuerySchema.validate(req.query, {
            abortEarly: true,
            stripUnknown: true
        });
        if (error) return res.status(400).json({ message: error.details[0].message });

        const where = {};
        if (value.companyId) where.companyId = value.companyId;
        if (value.clientId) where.clientId = value.clientId;
        if (value.agencyId) where.agencyId = value.agencyId;
        if (value.originAgencyId) where.originAgencyId = value.originAgencyId;
        if (value.destinationAgencyId) where.destinationAgencyId = value.destinationAgencyId;
        if (value.status) where.status = value.status;
        if (value.category) where.category = value.category;
        if (value.search) {
            where[Op.or] = [
                { trackingNumber: { [Op.like]: `%${value.search}%` } },
                { description: { [Op.like]: `%${value.search}%` } }
            ];
        }
        if (value.dateFrom || value.dateTo) {
            where.createdAt = {};
            if (value.dateFrom) where.createdAt[Op.gte] = value.dateFrom;
            if (value.dateTo) where.createdAt[Op.lte] = value.dateTo;
        }

        const page = Math.max(parseInt(value.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(value.limit, 10) || 20, 1), 200);
        const offset = (page - 1) * limit;

        const { rows, count } = await ParcelModel.findAndCountAll({
            where,
            include: parcelIncludes(),
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        return res.status(200).json({
            parcels: rows,
            total: count,
            page,
            limit
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getParcel = async (req, res) => {
    try {
        const parcel = await ParcelModel.findByPk(req.params.id, { include: parcelIncludes() });
        if (!parcel) return res.status(404).json({ message: 'Colis introuvable' });
        return res.status(200).json({ parcel });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getParcelHistory = async (req, res) => {
    try {
        const parcel = await ParcelModel.findByPk(req.params.id);
        if (!parcel) return res.status(404).json({ message: 'Colis introuvable' });

        const events = await TrackingEventModel.findAll({
            where: { parcelId: parcel.id },
            order: [['date', 'DESC']]
        });

        return res.status(200).json({ events });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getParcelPayments = async (req, res) => {
    try {
        const parcel = await ParcelModel.findByPk(req.params.id);
        if (!parcel) return res.status(404).json({ message: 'Colis introuvable' });

        const payments = await PaymentModel.findAll({
            where: { shipmentId: parcel.shipmentId },
            include: [
                { model: ShipmentModel, as: 'shipment' },
                { model: ClientModel, as: 'client' },
                { model: CompanyModel, as: 'company' },
                { model: AgencyModel, as: 'agency' }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ payments });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateParcelStatus = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const parcel = await ParcelModel.findByPk(req.params.id, { transaction });
        if (!parcel) return res.status(404).json({ message: 'Colis introuvable' });

        const newStatus = req.body.status;
        const previousStatus = parcel.status;

        await parcel.update({ status: newStatus }, { transaction });

        if (previousStatus !== newStatus) {
            await TrackingEventModel.create({
                parcelId: parcel.id,
                status: newStatus,
                location: req.body.location || parcel.destination || null,
                description: req.body.description || `Colis passé au statut ${newStatus}`,
                agentName: req.body.agentName || null,
                date: new Date()
            }, { transaction });
        }

        await transaction.commit();

        return res.status(200).json({
            parcel: await ParcelModel.findByPk(parcel.id, { include: parcelIncludes() }),
            message: 'Statut du colis mis à jour'
        });
    }
    catch (error) {
        await transaction.rollback();
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteParcel = async (req, res) => {
    try {
        const parcel = await ParcelModel.findByPk(req.params.id);
        if (!parcel) return res.status(404).json({ message: 'Colis introuvable' });

        const [trackingEvents, payments] = await Promise.all([
            TrackingEventModel.count({ where: { parcelId: parcel.id } }),
            PaymentModel.count({ where: { shipmentId: parcel.shipmentId } })
        ]);

        const total = trackingEvents + payments;
        if (total > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer : le colis possède ${total} élément(s) lié(s) (événements de suivi, paiements).`
            });
        }

        await parcel.destroy();

        return res.status(200).json({ message: 'Colis supprimé' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
