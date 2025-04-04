const db = require('../config/db');
const Menu = require('./Menu');

const Food = {
    addFood: async (food) => {
        // Check if the menu exists
        const menuSql = 'SELECT Menu_Name FROM MENU WHERE Menu_Name = ?';
        const [menuRows] = await db.query(menuSql, [food.Menu_Name]);

        if (menuRows.length === 0) {
            // Menu does not exist, return a message
            return { error: 'Menu does not exist' };
        }

        const sql = 'INSERT INTO PRODUCT (Product_Name, Image, Description, Size, Price, Menu_Name) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [food.Product_Name, food.Image, food.Description, food.Size, food.Price, food.Menu_Name]);
        const productId = result.insertId;

        if (food.SizeWithPrice) {
            let priceValues;
            if (Array.isArray(food.SizeWithPrice)) {
                priceValues = food.SizeWithPrice.map(sizePrice => [productId, sizePrice.Size, sizePrice.Price]);
            } else {
                priceValues = [[productId, food.SizeWithPrice.Size, food.SizeWithPrice.Price]];
            }
            const priceSql = 'INSERT INTO PRICE_WITH_SIZE (Product_ID, Size, Price) VALUES ?';
            await db.query(priceSql, [priceValues]);
        }

        return { id: productId };
    },

    listFood: async () => {
        const sql = 'SELECT Product_ID, Product_Name, Image, Description, Size, Price, Menu_Name FROM PRODUCT';
        const [productRows] = await db.query(sql);

        const products = await Promise.all(productRows.map(async (product) => {
            const priceSql = 'SELECT Size, Price FROM PRICE_WITH_SIZE WHERE Product_ID = ?';
            const [priceRows] = await db.query(priceSql, [product.Product_ID]);
            product.SizeWithPrice = priceRows;
            return product;
        }));

        return products;
    },

    removeFood: async (id) => {
        const sql = 'DELETE FROM PRODUCT WHERE Product_ID = ?';
        await db.query(sql, [id]);
    },

    findFoodById: async (id) => {
        const sql = 'SELECT * FROM PRODUCT WHERE Product_ID = ?';
        const [productRows] = await db.query(sql, [id]);
        if (productRows.length === 0) {
            return null;
        }

        const priceSql = 'SELECT Size, Price FROM PRICE_WITH_SIZE WHERE Product_ID = ?';
        const [priceRows] = await db.query(priceSql, [id]);

        const product = productRows[0];
        product.SizeWithPrice = priceRows;

        return product;
    },

    updateFood: async (id, food) => {
        if (food.Menu_Name) {
            const menuSql = 'SELECT Menu_Name FROM MENU WHERE Menu_Name = ?';
            const [menuRows] = await db.query(menuSql, [food.Menu_Name]);
            if (menuRows.length === 0) {
                return { error: 'Menu does not exist' };
            }
        }

        const fields = [];
        const values = [];

        if (food.Product_Name) {
            fields.push('Product_Name = ?');
            values.push(food.Product_Name);
        }
        if (food.Image) {
            fields.push('Image = ?');
            values.push(food.Image);
        }
        if (food.Description) {
            fields.push('Description = ?');
            values.push(food.Description);
        }
        if (food.Size) {
            fields.push('Size = ?');
            values.push(food.Size);
        }
        if (food.Price) {
            fields.push('Price = ?');
            values.push(food.Price);
        }
        if (food.Menu_Name) {
            fields.push('Menu_Name = ?');
            values.push(food.Menu_Name);
        }

        if (fields.length > 0) {
            const sql = `UPDATE PRODUCT SET ${fields.join(', ')} WHERE Product_ID = ?`;
            values.push(id);
            await db.query(sql, values);
        }

        if (food.SizeWithPrice) {
            const deletePriceSql = 'DELETE FROM PRICE_WITH_SIZE WHERE Product_ID = ?';
            await db.query(deletePriceSql, [id]);

            let priceValues;
            if (Array.isArray(food.SizeWithPrice)) {
                priceValues = food.SizeWithPrice.map(sizePrice => [id, sizePrice.Size, sizePrice.Price]);
            } else {
                priceValues = [[id, food.SizeWithPrice.Size, food.SizeWithPrice.Price]];
            }
            const priceSql = 'INSERT INTO PRICE_WITH_SIZE (Product_ID, Size, Price) VALUES ?';
            await db.query(priceSql, [priceValues]);
        }

        return { id };
    },
};

module.exports = Food;
