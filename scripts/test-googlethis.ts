import google from 'googlethis';

async function run() {
    try {
        const res = await google.image('Apple iPhone 16 Pro Max high resolution product shot', { safe: false });
        console.log(`Found ${res.length} images`);
        console.log(res[0]);
    } catch (e) {
        console.log("Error:", e);
    }
}
run();
