import express from "express"
import { getAllCars,addCar,updateCar,deleteCar } from "../controller/mobilController.js"
import { verifyUser } from "../middleWare/authMiddleWare.js"

const router = express.Router()
router.get("/", getAllCars)
router.post("/", verifyUser(["admin", "petugas"]), addCar)
router.put("/:id", verifyUser(["admin", "petugas"]), updateCar)
router.delete("/:id", verifyUser(["admin", "petugas"]), deleteCar)

export default router