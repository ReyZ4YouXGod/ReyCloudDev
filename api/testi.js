const { Telegraf } = require('telegraf');
const config = require('../config.js');
const bot = new Telegraf(config.token);

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { price, pkg, type, user } = req.body;
    const totalBayar = price + 300;
    const tgl = new Date().toLocaleString('id-ID');

    let testiTeks = `🚀 <b>PEMBAYARAN TERVERIFIKASI</b>\n\n✨ <b>TERIMA KASIH TELAH MEMILIH REYCLOUD</b>\n\n📦 <b>DETAIL PESANAN</b>\n┣ Layanan : ${type === 'reseller' ? 'RESELLER PANEL' : pkg}\n┗ Payment : QRIS\n\n💰 <b>RINCIAN PEMBAYARAN</b>\n┣ Harga : <code>Rp ${price.toLocaleString('id-ID')}</code>\n┣ Admin : <code>Rp 300</code>\n┗ Total : <code>Rp ${totalBayar.toLocaleString('id-ID')}</code>\n\n━━━━━━━━━━━━━━━━━━━━━━\n✅ <b>STATUS : SUKSES (AUTO-DEPLOYED)</b>\n🕒 <b>WAKTU  :</b> ${tgl}\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 <i>Butuh Panel? Gampang, beli di https://reyclouddev.xyzid.store</i>\n- ReyCloudDev Solusi Hosting Terpecaya ✅`;

    try {
        await bot.telegram.sendPhoto(config.chTestiId, config.panel, { caption: testiTeks, parse_mode: "HTML" });
        res.status(200).send("Berhasil");
    } catch (e) { res.status(500).send(e.message); }
};
