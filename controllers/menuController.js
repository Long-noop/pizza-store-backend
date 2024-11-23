const Menu = require('../models/Menu');
const fs = require('fs');
const path = require('path');

const menuController = {
  addMenu: async (req, res) => {
    try {
      const menuData = req.body;
      if (req.file) {
        const imagePath = path.join("uploads", req.file.filename);
        menuData.Image = imagePath;
      }

      // Check if the menu already exists
      const existingMenu = await Menu.findMenuByName(menuData.Menu_Name);
      if (existingMenu) {
        if (req.file) {
          fs.unlinkSync(req.file.path); // Delete the uploaded image
        }
        return res
          .status(400)
          .json({ success: false, message: "Menu already exists" });
      }

      await Menu.addMenu(menuData);
      res
        .status(201)
        .json({ success: true, message: "Menu added successfully" });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete the uploaded image
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },

  removeMenu: async (req, res) => {
    if (!req.params.Menu_Name) {
      return res.status(400).json({ error: "Menu Name is required" });
    }
    try {
      const existingMenu = await Menu.findMenuByName(req.params.Menu_Name);
      if (!existingMenu) {
        return res.status(404).json({ error: "Menu not found" });
      }
      if (existingMenu.Image) {
        fs.unlinkSync(path.join(__dirname, "..", existingMenu.Image)); // Delete the uploaded image
      }
      await Menu.removeMenu(req.params.Menu_Name);
      res.status(200).json({ message: "Menu removed successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  editMenu: async (req, res) => {
    if (!req.params.Menu_Name) {
      return res.status(400).json({ error: "Menu Name is required" });
    }
    try {
      const existingMenu = await Menu.findMenuByName(req.params.Menu_Name);
      if (!existingMenu) {
        if (req.file) {
          fs.unlinkSync(req.file.path); // Delete the uploaded image
        }
        return res.status(404).json({ error: "Menu not found" });
      }
      const menuData = req.body;
      if (req.file) {
        const imagePath = path.join("uploads", req.file.filename);
        menuData.Image = imagePath;
        if (existingMenu.Image) {
          fs.unlinkSync(path.join(__dirname, "..", existingMenu.Image)); // Delete the old image
        }
      }
      await Menu.editMenu(req.params.Menu_Name, menuData);
      res.status(200).json({ message: "Menu updated successfully" });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete the uploaded image
      }
      res.status(500).json({ error: error.message });
    }
  },

  listMenus: async (req, res) => {
    try {
      const menus = await Menu.listMenus();
      res.status(200).json(menus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = menuController;
