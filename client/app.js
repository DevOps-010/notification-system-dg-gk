document.addEventListener('DOMContentLoaded', () => {
    const notificationsContainer = document.getElementById('notifications');
    const connectionStatus = document.getElementById('connection-status');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    const socket = new WebSocket('ws://localhost:4000');
    
    socket.addEventListener('open', () => {
      connectionStatus.textContent = 'Connected';
      connectionStatus.style.color = 'green';
      
      addNotification({
        type: 'info',
        message: 'Connected to notification server'
      });
    });
    
    socket.addEventListener('close', () => {
      connectionStatus.textContent = 'Disconnected';
      connectionStatus.style.color = 'red';
      
      addNotification({
        type: 'info',
        message: 'Disconnected from server'
      });
      
      setTimeout(() => {
        connectionStatus.textContent = 'Reconnecting...';
        connectionStatus.style.color = 'orange';
        window.location.reload();
      }, 5000);
    });
    
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        addNotification(data);
      } catch (error) {
        addNotification({
          type: 'info',
          message: event.data
        });
      }
    });
    
    socket.addEventListener('error', (error) => {
      connectionStatus.textContent = 'Connection Error';
      connectionStatus.style.color = 'red';
      console.error('WebSocket error:', error);
    });
    
    function sendMessage() {
      const message = messageInput.value.trim();
      if (message && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
        messageInput.value = '';
      }
    }
    
    function addNotification(data) {
      const notificationElement = document.createElement('div');
      notificationElement.className = `notification ${data.type}`;
      notificationElement.textContent = data.message;
      
      notificationsContainer.appendChild(notificationElement);
      notificationsContainer.scrollTop = notificationsContainer.scrollHeight;
    }
    
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  });
  