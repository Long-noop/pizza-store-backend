const db = require('../config/db');

const Menu = {
    addMenu: async (menu) => {
        const sql = 'INSERT INTO MENU (Menu_Name, Image, Description) VALUES (?, ?, ?)';
        await db.query(sql, [menu.Menu_Name, menu.Image, menu.Description]);
    },

    removeMenu: async (Menu_Name) => {
        const sql = 'DELETE FROM MENU WHERE Menu_Name = ?';
        await db.query(sql, [Menu_Name]);
    },

    editMenu: async (id, menu) => {
        const sql = 'UPDATE MENU SET Menu_Name = ?, Image = ?, Description = ? WHERE Menu_Name = ?';
        await db.query(sql, [menu.Menu_Name, menu.Image, menu.Description, id]);
    },

    findMenuByName: async (menuName) => {
        const sql = 'SELECT * FROM MENU WHERE Menu_Name = ?';
        const [rows] = await db.query(sql, [menuName]);
        return rows.length > 0 ? rows[0] : null;
    },

    listMenus: async () => {
        const sql = 'SELECT * FROM MENU';
        const [rows] = await db.query(sql);
        return rows;
    }
};

module.exports = Menu;
