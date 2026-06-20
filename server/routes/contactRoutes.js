const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const checkPlan = require("../middleware/checkPlan");

const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const router = express.Router();

router.use(authMiddleware);
router.use(checkPlan(["pro"]));

router.get("/", getContacts);
router.get("/:id", getContactById);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

module.exports = router;