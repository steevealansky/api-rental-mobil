import express from "express"
import mobilRoutes from "./routes/mobilRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import sewaRoutes from "./routes/sewaRoutes.js"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/mobil", mobilRoutes)
app.use("/api/user", userRoutes)
app.use("/api/sewa", sewaRoutes)

app.get("/", (req, res) => {res.send("server sudah jalan")})
app.listen(5000, () => {console.log("server jalan di port 5000")})