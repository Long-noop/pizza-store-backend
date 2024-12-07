const Supplier = require('../models/Supplier');

exports.addSupplier = async (req, res) => {
    try {
        delete req.body.Supplier_ID;
        // Kiểm tra nếu SizeWithPrice là chuỗi và chuyển thành mảng đối tượng
        if (typeof req.body.IngredientWithPrice === 'string') {
            try {
                req.body.IngredientWithPrice = JSON.parse(req.body.IngredientWithPrice);  // Chuyển chuỗi thành mảng đối tượng
            } catch (error) {
                return res.status(400).json({ error: 'Invalid JSON format in IngredientWithPrice' });
            }
        }

        // Kiểm tra lại SizeWithPrice sau khi chuyển đổi
        if (!Array.isArray(req.body.IngredientWithPrice) || req.body.IngredientWithPrice.length === 0) {
            return res.status(400).json({ error: 'Invalid size and price information' });
        }
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

        if (req.body.IngredientWithPrice) {
            if (typeof req.body.IngredientWithPrice === 'string') {
                try {
                    req.body.IngredientWithPrice = JSON.parse(req.body.IngredientWithPrice);  // Chuyển chuỗi thành mảng đối tượng
                } catch (error) {
                    return res.status(400).json({ error: 'Invalid JSON format in IngredientWithPrice' });
                }
            }

            // Kiểm tra lại SizeWithPrice sau khi chuyển đổi
            if (!Array.isArray(req.body.IngredientWithPrice) || req.body.IngredientWithPrice.length === 0) {
                return res.status(400).json({ error: 'Invalid size and price information' });
            }
        }
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