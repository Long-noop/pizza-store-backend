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
        return { id: result.insertId };
    },

    listFood: async () => {
        const sql = 'SELECT Product_ID, Product_Name, Image, Description, Size, Price, Menu_Name FROM PRODUCT';
        const [rows] = await db.query(sql);
        return rows;
    },

    removeFood: async (id) => {
        const sql = 'DELETE FROM PRODUCT WHERE Product_ID = ?';
        await db.query(sql, [id]);
    },

    findFoodById: async (id) => {
        const sql = 'SELECT * FROM PRODUCT WHERE Product_ID = ?';
        const [rows] = await db.query(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
};

module.exports = Food;
