const http = require('http');
const url = require('url');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    if (reqUrl.pathname == '/' && req.method === 'GET') {
        fs.readFile('index.html', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error reading file');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } 
    else if (reqUrl.pathname == '/calculus' && req.method === 'GET') {
        fs.readFile('index2.html', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error reading file');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } 
    else if (reqUrl.pathname == '/access-token' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const username = JSON.parse(body).email;
            const password = JSON.parse(body).password;
            try {
                const login = await fetch("https://login.plario.ru/account/login?culture=ru", {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/json",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "sec-gpc": "1",
                    },
                    "referrer": "https://login.plario.ru/login",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": `{\"username\":\"${username}\",\"password\":\"${password}\"}`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "same-origin"
                });

                if (login.status != 200 || !login.ok) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end("Wrong email or password");
                }
                else{
                    const login_response_headers = login.headers.get('set-cookie');
                    let set_cookie_list = login_response_headers.split(', ');
                    let plario_token_string = "";
                    for (let i = set_cookie_list.length - 1; i >= 0; i--) {
                        const plario_token = set_cookie_list[i].split('=');
                        if (plario_token[0] === "PlarioToken" && plario_token[1] != "") {
                            plario_token_string = plario_token[1];
                            break;
                        }
                    }
                    const decoded_plario_token = decodeURIComponent(plario_token_string);
                    const json_plario_token = JSON.parse(decoded_plario_token.split('; ')[0]);
                    const ACCESS_TOKEN = json_plario_token.accessToken;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({"access_token" : ACCESS_TOKEN}));
                }
            }
            catch(err){
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Server error");
            }

        });

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = process.env.PORT || 3030;
server.listen(port, () => console.log(`Server running on port ${port}!`));