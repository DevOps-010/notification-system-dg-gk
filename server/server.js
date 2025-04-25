const WebSocket = require('ws');
const redis = require('redis');
const { promisify } = require('util');

const wss = new WebSocket.Server({ port: 4000 });
console.log('WebSocket server started on port 4000');

const redisClient = redis.createClient({
  host: 'redis', 
  port: 6379
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

const subscriber = redisClient.duplicate();
subscriber.subscribe('notifications');

subscriber.on('message', (channel, message) => {
  console.log(`Received message from ${channel}: ${message}`);
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Connected to notification server'
  }));
  
  ws.on('message', (message) => {
    console.log(`Received from client: ${message}`);
    
    redisClient.publish('notifications', JSON.stringify({
      type: 'user',
      message: message.toString()
    }));
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function publishNotification(message) {
  redisClient.publish('notifications', JSON.stringify({
    type: 'notification',
    message
  }));
}
setInterval(() => {
  publishNotification(`Server time: ${new Date().toLocaleTimeString()}`);
}, 10000);
