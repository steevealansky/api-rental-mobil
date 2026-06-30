import express from "express"
import { getAllUsers,addUser,updateUser,deleteUser,loginUser } from "../controller/userController.js"
import { verifyUser } from "../middleWare/authMiddleWare.js"

const router = express.Router()
router.get("/",verifyUser(["admin","petugas"]), getAllUsers)
router.post("/", addUser)
router.put("/:id",verifyUser(["admin","petugas"]), updateUser)
router.delete("/:id",verifyUser(["admin","petugas"]), deleteUser)
router.post("/login", loginUser)

export default router