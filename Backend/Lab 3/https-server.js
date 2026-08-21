import http from 'http';
const server = http.createServer((req, res) => {
    const url= req.url;
    const method= req.method;
    if (url === '/msg' && method === 'GET') {
        res.write('Hello World\n');
        res.end();
    }
});
server.listen(5000, () => {
    console.log('Server is running at 5000');
});