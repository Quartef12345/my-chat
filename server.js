const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

let lobbys_history = {}

// Serve o ficheiro index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

// Quando alguém se liga
io.on('connection', (socket) => {
  console.log('Someone Connected!')

  // Quando alguém se desliga
  socket.on('disconnect', () => {
    console.log('Someon Left!')
  })
  socket.on('enter_lobby', (data) => {
    console.log(data.user + ' connected to the lobby ' + data.lobby)
    socket.join(String(data.lobby))
    let joineData = { ...data }
    joineData.message = " joined the lobby"
    io.to(String(data.lobby)).emit('receive_message', joineData)

    if (lobbys_history[data.lobby] == null){
      lobbys_history[data.lobby] = []
      lobbys_history[data.lobby].push(joineData)
    }else{
      lobbys_history[data.lobby].push(joineData)
    }
  })
  socket.on('left_lobby', (data) => {
    console.log(data.user + ' left lobby ' + data.lobby)
    let leftData = { ...data }
    leftData.message = " left the lobby"
    io.to(String(data.lobby)).emit('receive_message', leftData)
    socket.leave(String(data.lobby))
    
    if (lobbys_history[data.lobby] == null){
      lobbys_history[data.lobby] = []
      lobbys_history[data.lobby].push(leftData)
    }else{
      lobbys_history[data.lobby].push(leftData)
    }

  })
  socket.on('send_message', (data) => {
    console.log(data.user + ' sent message "' + data.message + '" to lobby ' + data.lobby)
    io.to(String(data.lobby)).emit('receive_message', data)
    if (lobbys_history[data.lobby] == null){
      lobbys_history[data.lobby] = []
      lobbys_history[data.lobby].push(data)
    }else{
      lobbys_history[data.lobby].push(data)
    }
  })
  socket.on('retrieve_history', (lobby_id) => {
    console.log(lobbys_history)
    socket.emit('load_history', lobbys_history[lobby_id])
  })
})

// Inicia o servidor na porta 3000
http.listen(3000, () => {
  console.log('Servidor a correr em http://localhost:3000')
})