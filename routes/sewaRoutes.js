import express from "express"
import { addSewa, getAllSewa, getSewaByUserId, updateSewa, deleteSewa } from "../controller/sewaController.js"
import { verifyUser } from "../middleWare/authMiddleWare.js"

const router = express.Router()
router.get("/",verifyUser(["admin","petugas"]), getAllSewa)
router.post("/",verifyUser(["admin","petugas", "pelanggan"]), addSewa)
router.put("/:id",verifyUser(["admin","petugas"]), updateSewa)
router.delete("/:id",verifyUser(["admin","petugas"]), deleteSewa)
router.get("/:id",verifyUser(["admin","petugas", "pelanggan"]), getSewaByUserId)

export default router