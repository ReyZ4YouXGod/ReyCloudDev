function showPage(id) { document.querySelectorAll('.page').forEach(p => p.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }
document.addEventListener('DOMContentLoaded', () => { Object.keys(config.prices).forEach(key => { let opt = document.createElement('option'); opt.value = key; opt.innerHTML = `${key.toUpperCase()} - Rp ${config.prices[key].toLocaleString()}`; document.getElementById('pkgSelect').appendChild(opt); }); });

async function deployPtero(u, pKey) {
    try {
        const pkg = config.resourceMap[pKey];
        const pass = u + Math.floor(Math.random() * 999);
        await axios.post(`${config.domain}/api/application/users`, {email:`${u}@rey.com`, username:u, first_name:u, last_name:"User", password:pass}, {headers:{"Authorization":`Bearer ${config.plta}`}});
        await axios.post(`${config.domain}/api/application/servers`, {name:u, user:1, nest:parseInt(config.nest), egg:parseInt(config.eggs), limits:{memory:pkg.ram, swap:0, disk:pkg.disk, cpu:pkg.cpu}, deploy:{locations:[parseInt(config.loc)], dedicated_ip:false, port_range:[]}}, {headers:{"Authorization":`Bearer ${config.plta}`}});
        const txt = `✅ AKUN BERHASIL DIBUAT\nUser: ${u}\nPass: ${pass}\nPanel: ${config.domain}`;
        document.getElementById('rawText').innerText = txt;
        document.getElementById('resultArea').classList.remove('hidden');
        document.getElementById('btnCopyAll').onclick = () => navigator.clipboard.writeText(txt).then(() => alert("Tersalin!"));
    } catch(e) { alert("Deploy gagal!"); }
}

async function createOrder(amount, isReseller, u = "") {
    const id = (isReseller ? "RESS-" : "PAN-") + Date.now();
    const frame = isReseller ? document.getElementById('frameReseller') : document.getElementById('qrisFrame');
    frame.src = `https://app.pakasir.com/pay/${config.pakasir.project}/${amount}?order_id=${id}`;
    frame.classList.remove('hidden');
    const check = setInterval(async () => {
        const res = await axios.get(`https://app.pakasir.com/api/transactiondetail?api_key=${config.pakasir.apiKey}&project=${config.pakasir.project}&order_id=${id}&amount=${amount}`);
        if(res.data.transaction?.status === 'completed') {
            clearInterval(check);
            if(!isReseller) {
                deployPtero(u, document.getElementById('pkgSelect').value);
                const pkgName = document.getElementById('pkgSelect').options[document.getElementById('pkgSelect').selectedIndex].text;
                axios.post('/api/testi', { price: amount, pkg: pkgName, type: 'panel', user: u });
            } else { 
                alert("Reseller Aktif!"); 
                axios.post('/api/testi', { price: amount, pkg: 'Reseller', type: 'reseller' });
            }
        }
    }, 5000);
}
document.getElementById('btnOrder').onclick = () => createOrder(config.prices[document.getElementById('pkgSelect').value], false, document.getElementById('usernameInput').value);
document.getElementById('btnOrderReseller').onclick = () => createOrder(config.resellerPrice, true);
