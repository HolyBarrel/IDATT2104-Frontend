const socket = new WebSocket('ws://localhost:8765')

socket.onopen = () => {
  console.log('WebSocket connection established.')
}

socket.onmessage = (event) => {
  const message = event.data
  console.log('Received message:', JSON.parse(message))
}

socket.onclose = () => {
  console.log('WebSocket connection closed.')
}

socket.onerror = (error) => {
  console.error('WebSocket connection error:', error)
}

export default socket
