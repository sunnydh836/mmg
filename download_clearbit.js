const fs = require('fs');
const https = require('https');

const clearbitBrands = {
    realme: 'realme.com',
    redmi: 'mi.com',  // using mi.com for now
    nothing: 'nothing.tech',
    infinix: 'infinixmobility.com',
    tecno: 'tecno-mobile.com',
    poco: 'po.co',
    iqoo: 'iqoo.com'
};

for (const [brand, domain] of Object.entries(clearbitBrands)) {
    const file = fs.createWriteStream(`public/brands/${brand}.png`);
    https.get(`https://logo.clearbit.com/${domain}`, response => {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Saved Clearbit logo for ${brand}`);
            });
        } else {
            console.log(`Failed to get Clearbit logo for ${brand} (${response.statusCode})`);
        }
    }).on('error', err => {
        console.log(`Error on ${brand}: ${err.message}`);
    });
}
