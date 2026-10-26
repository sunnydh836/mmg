const fs = require('fs');
const si = require('simple-icons');

const brands = {
    apple: si.siApple,
    samsung: si.siSamsung,
    oneplus: si.siOneplus,
    oppo: si.siOppo,
    vivo: si.siVivo,
    realme: si.siRealme,
    xiaomi: si.siXiaomi,
    redmi: si.siRedmi,
    motorola: si.siMotorola,
    nothing: si.siNothing,
    google: si.siGoogle,
    infinix: null,
    tecno: null,
    poco: si.siPoco,
    iqoo: null
};

if (!fs.existsSync('public/brands')) fs.mkdirSync('public/brands', { recursive: true });

for (const [key, icon] of Object.entries(brands)) {
    if (icon && icon.path) {
        fs.writeFileSync('public/brands/' + key + '.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="' + icon.path + '"/></svg>');
        console.log('Saved ' + key);
    } else {
        console.log('Skipped ' + key);
    }
}
