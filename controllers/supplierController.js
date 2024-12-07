const Supplier = require('../models/Supplier');

exports.addSupplier = async (req, res) => {
    try {
        delete req.body.userId;
        const supplierId = await Supplier.addSupplier(req.body);
        res.status(200).json({
            supplierId: supplierId
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.removeSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        await Supplier.removeSupplier(id);
        res.status(200).json({ message: 'Supplier removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.listSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.getAllSuppliers();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        await Supplier.updateSupplier(id, req.body);
        res.status(200).json({
        message: 'Supplier updated successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getIngredientsBySupplierId = async (req, res) => {
    try {
        const { id } = req.params;
        const ingredients = await Supplier.getIngredientsBySupplierId(id);
        res.status(200).json(ingredients);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.getSupplierById(id);
        res.status(200).json(supplier);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};