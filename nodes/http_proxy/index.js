const net = require("net")
const http = require("http")
const url = require('url');

const server = http.createServer((request, response) => {
  console.info(request.url)
  const proxyedHost = url.parse(request.url);
  const options = {
    port: proxyedHost.port,
    hostname: proxyedHost.hostname,
    method: request.method,
    path: proxyedHost.path,
    headers: request.headers
  };
  let proxy = http.request(options);
  request.on('error', (err) => {
    console.info(`${err.message}`);
    proxy.destroy(err);
  });

  proxy.on('error', (error) => {
    console.info(`${error.message} on proxy ${proxy.ipaddress}:${proxy.port}`);
    response.writeHead(500);
    response.end('Connection error\n');
  });

  proxy.on('response', (proxyResponse) => {
    proxyResponse.pipe(response);
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
  });

  request.pipe(proxy);
});

server.on("connect", (request, socket, head) => {
  const proxyedHost = url.parse(`http://${request.url}`);
  let proxy = net.createConnection({
    port: proxyedHost.port,
    host: proxyedHost.hostname,
  }, () => {
    proxy.pipe(socket);
    socket.pipe(proxy);
    socket.write(`HTTP/${request.httpVersion} 200 Connection established\r\n\r\n`);
    proxy.on('error', (err) => {
      console.info(`error on proxy connect [proxy] `, err)
      if (socket) {
        socket.destroy(err);
      }
    });
    // proxy.once('close', () => {
    //   proxy.destroy();
    //   socket.destroy();
    // })
  });
  // socket.once('close', () => {
  //   socket.destroy();
  //   if (proxy) proxy.destroy();
  // })
  socket.on('error', (err) => {
    console.info(`error on proxy connect [socket]:`, err)
    // console.info(err)
    if (proxy) {
      proxy.destroy(err);
    }
  });
});

server.listen(1080, '0.0.0.0', () => {
  console.info("server listening on 1080")
});

process.title = "node-http-proxy"
