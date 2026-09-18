import {Op} from 'sequelize';
import CityModel from '../model/CityModel.js';

export const createCity = async (req, res) => {
    try {
        const exist = await CityModel.findOne({ where: { name: req.body.name, country: req.body.country ?? 'Cameroun' } });
        if (exist) return res.status(400).json({ message: 'Cette ville existe déjà' });

        const city = await CityModel.create(req.body);

        return res.status(201).json({
            city: await CityModel.findByPk(city.id),
            message: 'Ville créée avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getCities = async (req, res) => {
    try {
        const { status, country, search, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status !== undefined && status !== '') where.status = status === 'true';
        if (country) where.country = country;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { region: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await CityModel.findAndCountAll({
            where,
            order: [['name', 'ASC']],
            limit: limitNum,
            offset
        });

        return res.status(200).json({ cities: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getCity = async (req, res) => {
    try {
        const city = await CityModel.findByPk(req.params.id);
        if (!city) return res.status(404).json({ message: 'Ville introuvable' });
        return res.status(200).json({ city });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateCity = async (req, res) => {
    try {
        const city = await CityModel.findByPk(req.params.id);
        if (!city) return res.status(404).json({ message: 'Ville introuvable' });

        if (req.body.name) {
            const exist = await CityModel.findOne({
                where: { name: req.body.name, country: req.body.country ?? city.country, id: { [Op.ne]: city.id } }
            });
            if (exist) return res.status(400).json({ message: 'Cette ville existe déjà' });
        }

        await city.update(req.body);

        return res.status(200).json({
            city: await CityModel.findByPk(city.id),
            message: 'Ville mise à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteCity = async (req, res) => {
    try {
        const city = await CityModel.findByPk(req.params.id);
        if (!city) return res.status(404).json({ message: 'Ville introuvable' });

        await city.destroy();

        return res.status(200).json({ message: 'Ville supprimée' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
