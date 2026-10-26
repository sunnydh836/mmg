const fs = require('fs');

async function fetchFavicon(name, domain) {
    const url = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;
    const res = await fetch(url);
    if (res.ok) {
        const buffer = await res.arrayBuffer();
        // Verify it's not mostly blank or a default globe. (Hard in JS quickly, but we trust Google).
        fs.writeFileSync('public/brands/' + name + '.png', Buffer.from(buffer));
        console.log('Saved PNG for ' + name);
    } else {
        console.log('Failed PNG for ' + name);
    }
}

async function run() {
    await fetchFavicon('redmi', 'mi.com'); // Actually, redmi might reuse xiaomi's favicon... But let's check
    await fetchFavicon('poco', 'po.co');
    await fetchFavicon('iqoo', 'iqoo.com');
    await fetchFavicon('tecno', 'tecno-mobile.com');
    await fetchFavicon('nothing', 'nothing.tech');
}

run();
