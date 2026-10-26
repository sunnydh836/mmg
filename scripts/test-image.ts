// test-image.ts
import https from 'https';

const url = 'https://image01.realme.net/general/20240618/1718698517226048d0ab914dd4ade9ff5a43dbed32e0e.png.webp';
https.get(url, (res) => {
    console.log('Status code:', res.statusCode);
    console.log('Headers:', res.headers['content-type'], res.headers['content-length']);
}).on('error', (e) => {
    console.error(e);
});
