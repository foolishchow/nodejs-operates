// write an reverse proxy with nodejs
const net = require("net");
const http = require("http")
const EOL = require("os").EOL;
const readFile = require("fs").readFileSync;
const pathRoot = "~/Downloads/spring-boot-vue-admin-master/admin/dist";

const server = http.createServer((request, response) => {
  let path = request.url;
  console.info(path)
  if (/^\/(account|role|permission)/.test(path)) {
    console.info(path)
    let res = http.request({
      protocol: "http:",
      method: request.method,
      path: request.url,
      hostname: "localhost",
      port: 8080,
      headers: {
        ...request.headers,
        // host: 'localhost:8080',
        'x-real-ip': request.socket.remoteAddress
      },
      timeout: 3
    }, (r) => {
      for (let key in r.headers) {
        response.setHeader(key, r.headers[key])
      }
      r.pipe(response)
    });
    request.pipe(res)

  } else {
    let res = http.request({
      protocol: "http:",
      method: request.method,
      path: request.url,
      hostname: "127.0.0.1",
      port: 9999,
      headers: {
        ...request.headers,
        host: 'localhost:9999',
        'x-real-ip': request.socket.remoteAddress
      },
      timeout: 3
    }, (r) => {
      for (let key in r.headers) {
        response.setHeader(key, r.headers[key])
      }
      r.pipe(response)
    });
    request.pipe(res)

  }
});


const netServer = net.createServer();

netServer.on('connection', (socket) => {
  // socket.once('data', data => {
  // console.info(data.toString())
  server.emit('connection', socket)
  // })

})

netServer.listen(3001);
