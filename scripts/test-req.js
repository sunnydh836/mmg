import { exec } from 'child_process';
import http from 'http';

console.log("Starting Next.js dev server...");
const server = exec('npm run dev');
let started = false;

server.stdout.on('data', (data) => {
    if (data.includes('Ready in') || data.includes('compiled client and server successfully')) {
        if (!started) {
            started = true;
            console.log("Dev server is ready. Fetching homepage...");
            setTimeout(() => {
                http.get('http://localhost:3000', (res) => {
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        console.log("Status Code:", res.statusCode);
                        if (body.includes('TEST_OFFERS_SERVER_ERROR')) {
                            console.log("Found error text in HTML!");
                        }
                        if (body.includes('Something went wrong with this section.')) {
                            console.log("SUCCESS: Found PremiumErrorFallback in HTML!");
                        }
                        if (body.includes('Your Next Phone')) {
                            console.log("SUCCESS: Hero section rendered successfully despite the error!");
                        }

                        // Cleanup
                        server.kill();
                        process.exit(0);
                    });
                }).on('error', (e) => {
                    console.error("Fetch error:", e);
                    server.kill();
                    process.exit(1);
                });
            }, 3000);
        }
    }
});

server.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
});
