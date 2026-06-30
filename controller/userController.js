import db from "../config/db.js"

export async function getAllUsers(req, res) {
    try {
        const [users] = await db.query(`SELECT * from user`)
        res.json({success: true, data: users})
    } catch (error) {
        console.error(error)
        res.status(500).json({success: false, message: "gagal mengambil data"})
    }
}

export async function addUser(req, res) {
    const {username, email, password} = req.body
    if (!username || !email || !password) {
        return res.status(400).json({success: false, message:"data tidak lengkap"})
    }
    try {
        await db.query(`INSERT INTO user (username, email, password) values (?,?, sha2(?,256))`, [username, email, password])
        res.status(201).json({success:true, message:"berhasil menyimpan"})
    } catch (error) {
        console.error(error)
        res.status(500).json({success: false, message: "gagal menyimpan data"}) 
    }
}

export async function updateUser(req, res) {
    const {id} = req.params
    const {username, email, password, status} = req.body
    if (!username || !email || !password || !status) {
        return res.status(400).json({success: false, message:"data tidak lengkap"})
    }
    try {
        await db.query(`UPDATE user set username=?, email=?, password= sha2(?,256), status=? where id=?`, [username, email, password, status, id])
        res.status(200).json({success:true, message:"berhasil"})
    } catch (error) {
       console.error(error)
        res.status(500).json({success: false, message: "gagal menyimpan data"})  
    }
}

export async function deleteUser(req, res) {
    const {id} = req.params
    try {
        await db.query(`DELETE from user where id=?`, [id])
        res.status(200).json({success:true, message:"berhasil"})
    } catch (error) {
        console.error(error)
        res.status(500).json({success: false, message: "gagal menghapus data"})  
    }
}

export async function loginUser(req, res) {
    const {username, password} = req.body
    try {
        const [rows] = await db.query(`SELECT * from user where username = ? and password = sha2(?,256)`, [username, password])
        if (rows.length == 0) {
            return res.status(401).json({success: false, message: "username atau password salah"})
        }
        const user = rows[0]
        const token = Buffer.from(JSON.stringify(user)).toString("base64")
        res.json({success: true, message: "login success", token: token })
    } catch (error) {
        console.error(error)
        res.status(500).json({success: false, message: "gagal login"})   
    }
    
}