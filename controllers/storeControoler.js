const db = require('../config/db.js');
// API Lấy tất cả các cửa hàng
exports.getAllStores = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Store');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

// API Lấy cửa hàng theo ID
exports.getStoreById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM Store WHERE store_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch store information' });
  }
};

// API Thêm cửa hàng
exports.createStore = async (req, res) => {
  const { address, contact_info, manager_name, operating_hours } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Store (address, contact_info, manager_name, operating_hours) VALUES (?, ?, ?, ?)',
      [address, contact_info, manager_name, operating_hours]
    );
    res.status(201).json({ message: 'Store created successfully', store_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create store' });
  }
};

// API Cập nhật cửa hàng
exports.updateStore = async (req, res) => {
  const { id } = req.params;
  const { address, contact_info, manager_name, operating_hours } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Store SET address = ?, contact_info = ?, manager_name = ?, operating_hours = ? WHERE store_id = ?',
      [address, contact_info, manager_name, operating_hours, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.status(200).json({ message: 'Store updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update store' });
  }
};

// API Xóa cửa hàng
exports.deleteStore = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM Store WHERE store_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete store. Ensure do not have any employees in store' });
  }
};
