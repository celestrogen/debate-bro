import { Server } from 'socket.io'

const matchMakingMap = new Map();

const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        console.log('*First use, starting socket.io')

        const io = new Server(res.socket.server)

        io.on('connection', socket => {
            socket.on('find match', msg => {
                const uuid = msg.uuid
                socket.join(uuid)
                let matchFound = false

                for (const [key, value] of matchMakingMap) {
                    if (key !== uuid) {
                        matchMakingMap.delete(key)
                        console.log(`found match ${key}`)

                        //offers mesturen me findMatch, dan offer 
                        //van de parent terugsturen when matched
                        const payload = {parent: key, child: uuid}

                        socket.emit('matched', payload)
                        io.in(key).emit('matched', payload)

                        matchFound = true
                        break;
                    }
                }

                socket.on('offer', payload => {
                    console.log(`sending offer to ${payload.target}`)
                    io.to(payload.target).emit("offer", payload)
                })

                socket.on("answer", payload => {
                    io.to(payload.target).emit("answer", payload)
                })

                socket.on('ice-candidate', incoming => {
                    io.to(incoming.target).emit("ice-candidate", incoming.candidate)
                })

                if (!matchFound) {
                    matchMakingMap.set(uuid, true)
                }

                socket.once('disconnect', function () {
                    socket.leave(uuid)
                    matchMakingMap.delete(uuid)
                });

            })
        })

        res.socket.server.io = io
    } else {
        console.log('socket.io already running')
    }
    res.end()
}

export const config = {
    api: {
        bodyParser: false
    }
}

export default ioHandler