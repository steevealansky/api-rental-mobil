import db from "../config/db.js";

export async function addSewa(req, res) {
  const { id_mobil, tanggal_sewa, tanggal_kembali } = req.body;
  const id = req.user.id
  if (!id_mobil || !tanggal_sewa || !tanggal_kembali) {
    return res
      .status(400)
      .json({ success: false, message: "Data tidak lengkap" });
  }

  try {
    const [mobil] = await db.query("SELECT harga_perhari FROM mobil WHERE id = ?", [id_mobil]);
    if (mobil.length === 0) {
      return res.status(404).json({ success: false, message: "Mobil tidak ditemukan" });
    }
    const harga_perhari = mobil[0].harga_perhari;

    const [cekSewa] = await db.query(
      "SELECT * FROM sewa WHERE id_mobil = ? AND status IN ('disewa', 'siap')",
      [id_mobil]
    );
    if (cekSewa.length > 0) {
      return res.status(400).json({ success: false, message: "Mobil sedang tidak tersedia (sudah disewa/booking)" });
    }

    // Hitung selisih hari 
    const tglSewa = new Date(tanggal_sewa);
    const tglKembali = new Date(tanggal_kembali);
    
    // Hitung perbedaan waktu dalam milidetik, lalu konversi ke hari
    const selisihWaktu = tglKembali.getTime() - tglSewa.getTime();
    let selisihHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));
    
    // Validasi jika tanggal kembali lebih kecil dari tanggal sewa
    if (selisihHari <= 0) {
      return res.status(400).json({ success: false, message: "Tanggal kembali harus setelah tanggal sewa" });
    }

    const total_bayar = selisihHari * harga_perhari;

    // Tentukan status otomatis berdasarkan tanggal hari ini
    const hariIni = new Date();
    // Reset jam ke 00:00:00 supaya perbandingannya murni tanggal masehi
    hariIni.setHours(0, 0, 0, 0);
    tglSewa.setHours(0, 0, 0, 0);

    let statusOtomatis = "siap";
    if (tglSewa.getTime() === hariIni.getTime()) {
      statusOtomatis = "disewa";
    }

    const querySql = `INSERT INTO sewa (id_mobil, id_user, tanggal_sewa, tanggal_kembali, total_bayar, status) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(querySql, [id_mobil, id, tanggal_sewa, tanggal_kembali, total_bayar, statusOtomatis]);

    res.status(201).json({
      success: true,
      message: "Data sewa berhasil ditambahkan",
      data: { 
        id: result.insertId, 
        id_mobil, 
        id_user : id, 
        total_bayar,
        status: statusOtomatis 
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


export async function getAllSewa(req, res) {
  try {
    const querySql = `
      SELECT 
        sewa.id, 
        sewa.tanggal_sewa, 
        sewa.tanggal_kembali, 
        sewa.total_bayar, 
        sewa.status,
        user.username, 
        user.email,
        mobil.nama_mobil, 
        mobil.harga_perhari
      FROM sewa
      JOIN user ON sewa.id_user = user.id
      JOIN mobil ON sewa.id_mobil = mobil.id
      ORDER BY sewa.id DESC
    `;
    const [rows] = await db.query(querySql);
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data sewa",
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSewaByUserId(req, res) {
  const { id_user } = req.params;
  try {
    const querySql = `
      SELECT 
        sewa.id, 
        sewa.tanggal_sewa, 
        sewa.tanggal_kembali, 
        sewa.total_bayar, 
        sewa.status,
        mobil.nama_mobil
      FROM sewa
      JOIN mobil ON sewa.id_mobil = mobil.id
      WHERE sewa.id_user = ?
      ORDER BY sewa.id DESC
    `;
    const [rows] = await db.query(querySql, [id_user]);
    res.status(200).json({
      success: true,
      message: `Berhasil mengambil data sewa untuk user ID: ${id_user}`,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateSewa(req, res) {
  const { id } = req.params; 
  const { id_mobil, tanggal_sewa, tanggal_kembali, status } = req.body;
  try {
    const [cekSewa] = await db.query("SELECT * FROM sewa WHERE id = ?", [id]);
    if (cekSewa.length === 0) {
      return res.status(404).json({ success: false, message: "Data sewa tidak ditemukan" });
    }
    const finalIdMobil = id_mobil || cekSewa[0].id_mobil;
    const finalTglSewa = tanggal_sewa || cekSewa[0].tanggal_sewa;
    const finalTglKembali = tanggal_kembali || cekSewa[0].tanggal_kembali;
    const finalStatus = status || cekSewa[0].status;

    // 2. Ambil harga perhari mobil yang bersangkutan
    const [mobil] = await db.query("SELECT harga_perhari FROM mobil WHERE id = ?", [finalIdMobil]);
    if (mobil.length === 0) {
      return res.status(404).json({ success: false, message: "Mobil tidak ditemukan" });
    }
    const harga_perhari = mobil[0].harga_perhari;

    // 3. Hitung ulang total bayar
    const tglSewa = new Date(finalTglSewa);
    const tglKembali = new Date(finalTglKembali);
    const selisihWaktu = tglKembali.getTime() - tglSewa.getTime();
    let selisihHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));
    if (selisihHari <= 0) {
      return res.status(400).json({ success: false, message: "Tanggal kembali harus setelah tanggal sewa" });
    }
    const total_bayar = selisihHari * harga_perhari;
    const querySql = `UPDATE sewa SET id_mobil = ?, tanggal_sewa = ?, tanggal_kembali = ?, total_bayar = ?, status = ? WHERE id = ?
    `;
    await db.query(querySql, [finalIdMobil, finalTglSewa, finalTglKembali, total_bayar, finalStatus, id]);

    res.status(200).json({
      success: true,
      message: "Data sewa berhasil diperbarui",
      data: { id, id_mobil: finalIdMobil, total_bayar, status: finalStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteSewa(req, res) {
  const { id } = req.params;
  try {
    const [cekSewa] = await db.query("SELECT * FROM sewa WHERE id = ?", [id]);
    if (cekSewa.length === 0) {
      return res.status(404).json({ success: false, message: "Data sewa tidak ditemukan" });
    }
    await db.query("DELETE FROM sewa WHERE id = ?", [id]);
    res.status(200).json({
      success: true,
      message: "Data sewa berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}