const socket = new WebSocket('ws://10.24.36.138:8765')

socket.onopen = () => {
  console.log('WebSocket connection established.')

  const message = 'Hello, server!'
  console.log('Sending message:', message)
  //socket.send('{"is_perimeter": false, "is_changed": false, "x": 10, "y": 11, "weight": 0, "input": 0, "output": 0}')
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
