function showPage(id) { document.querySelectorAll('.page').forEach(p => p.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }

document.addEventListener('DOMContentLoaded', async () => {
    Object.keys(config.prices).forEach(key => {
        let opt = document.createElement('option'); opt.value = key; opt.innerHTML = `${key.toUpperCase()} - Rp ${config.prices[key].toLocaleString()}`;
        document.getElementById('pkgSelect').appendChild(opt);
    });

    const pending = JSON.parse(localStorage.getItem('pendingOrder'));
    if (pending) {
        showPage('pageOrder');
        document.getElementById('rawText').innerText = "🔄 Memeriksa status pembayaran...";
        document.getElementById('resultArea').classList.remove('hidden');
        
        const res = await axios.get(`https://app.pakasir.com/api/transactiondetail?api_key=${config.pakasir.apiKey}&project=${config.pakasir.project}&order_id=${pending.id}&amount=${pending.amount}`);
        if (res.data.transaction?.status === 'completed') {
            localStorage.removeItem('pendingOrder');
            if(!pending.isReseller) {
                deployPtero(pending.u, pending.pKey);
                axios.post('/api/testi', { price: pending.amount, pkg: pending.pkgName, type: 'panel', user: pending.u });
            } else {
                document.getElementById('rawText').innerText = "✅ Reseller Aktif!";
                axios.post('/api/testi', { price: pending.amount, pkg: 'Reseller', type: 'reseller' });
            }
        } else { document.getElementById('rawText').innerText = "❌ Pembayaran belum diterima!"; }
    }
});

async function deployPtero(u, pKey) {
    try {
        const pkg = config.resourceMap[pKey];
        const pass = u + Math.floor(Math.random() * 999);
        await axios.post(`${config.domain}/api/application/users`, {email:`${u}@rey.com`, username:u, first_name:u, last_name:"User", password:pass}, {headers:{"Authorization":`Bearer ${config.plta}`}});
        await axios.post(`${config.domain}/api/application/servers`, {name:u, user:1, nest:parseInt(config.nest), egg:parseInt(config.eggs), limits:{memory:pkg.ram, swap:0, disk:pkg.disk, cpu:pkg.cpu}, deploy:{locations:[parseInt(config.loc)], dedicated_ip:false, port_range:[]}}, {headers:{"Authorization":`Bearer ${config.plta}`}});
        const txt = `✅ AKUN BERHASIL DIBUAT\nUser: ${u}\nPass: ${pass}\nPanel: ${config.domain}`;
        document.getElementById('rawText').innerText = txt;
        document.getElementById('btnCopyAll').onclick = () => navigator.clipboard.writeText(txt).then(() => alert("Tersalin!"));
    } catch(e) { alert("Deploy gagal!"); }
}

async function createOrder(amount, isReseller, u = "", pKey = "", pkgName = "") {
    const id = (isReseller ? "RES-" : "REY-") + Date.now();
    localStorage.setItem('pendingOrder', JSON.stringify({ id, amount, u, isReseller, pKey, pkgName }));
    window.location.href = `https://app.pakasir.com/pay/${config.pakasir.project}/${amount}?order_id=${id}`;
}

document.getElementById('btnOrder').onclick = () => {
    const pKey = document.getElementById('pkgSelect').value;
    createOrder(config.prices[pKey], false, document.getElementById('usernameInput').value, pKey, document.getElementById('pkgSelect').options[document.getElementById('pkgSelect').selectedIndex].text);
};
document.getElementById('btnOrderReseller').onclick = () => createOrder(config.resellerPrice, true);
