const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/status', (request, response) => response.json({ clients: clients.length }));

const PORT = 3000;

let clients = [];
let livestreamEvents = [];

app.listen(PORT, () => {
    console.log(`Livestream service starting`)
})

function eventsHandler(request, response, next) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
   const clientId = request.query.clientId
    console.log(`clientId : ${clientId}`);

    response.writeHead(200, headers);
    const data = `data: ${JSON.stringify(livestreamEvents)}\n\n`;
    response.write(data);

    const newClient = {
      id: clientId,
      response
    };
  
    clients.push(newClient);
  
    request.on('close', () => {
      console.log(`${clientId} Connection closed`);
      clients = clients.filter(client => client.id !== clientId);
    });
  }
  
app.get('/events', eventsHandler);

function sendEventsToAll(livestreamEvent) {
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(livestreamEvent)}\n\n`))
}

function sendEventToClient(livestreamEvent){
    const clientId = livestreamEvent.clientId;
    const data = livestreamEvent.data;
    const client = clients.find( client => client.id === clientId )
    if(client) {
          console.log(`client response write`);
  client.response.write(`data: ${JSON.stringify(data)}\n\n`)
    } else {
          console.log(`else bug`);
}
}

async function addLivestreamEvent(request, respsonse, next) {
    const livestreamEvent = request.body;
    console.log(livestreamEvent);
    livestreamEvents.push(livestreamEvent);
    respsonse.json(livestreamEvent)
    return sendEventToClient(livestreamEvent);
}

app.post('/event', addLivestreamEvent);
