import db from "../config/db.js"

export async function getAllCars(req, res) {
    try {
        const [mobils] = await db.query(`SELECT * from mobil`)
        res.json({success: true, data: mobils})
    } catch (error) {
        console.error(error)
        res.status(500).json({success: false, message: "gagal mengambil data"})
    }
}

export async function addCar(req, res) {
    const {nama_mobil, harga_perhari} = req.body
    if (!nama_mobil || !harga_perhari) {
        return res.status(400).json({success: false, message:"data tidak lengkap"})
    }
    try {
        await db.query(`INSERT INTO mobil (nama_mobil, harga_perhari) values (?,?)`, [nama_mobil, harga_perhari])
        res.status(201).json({success:true, message:"berhasil menyimpan"})
    } catch (error) {
        console.error(error)
        res.status(500).json({success: false, message: "gagal menyimpan data"}) 
    }
}

export async function updateCar(req, res) {
    const {id} = req.params
    const {nama_mobil, harga_perhari, status} = req.body
    if (!nama_mobil || !harga_perhari || !status) {
        return res.status(400).json({success: false, message:"data tidak lengkap"})
    }
    try {
        await db.query(`UPDATE mobil set nama_mobil=?, harga_perhari=?, status=? where id=?`, [nama_mobil, harga_perhari, status, id])
        res.status(200).json({success:true, message:"berhasil"})
    } catch (error) {
       console.error(error)
        res.status(500).json({success: false, message: "gagal menyimpan data"})  
    }
}

export async function deleteCar(req, res) {
    const {id} = req.params
    try {
        await db.query(`DELETE from mobil where id=?`, [id])
        res.status(200).json({success:true, message:"berhasil"})
    } catch (error) {
        console.error(error)
        res.status(500).json({success: false, message: "gagal menghapus data"})  
    }
}