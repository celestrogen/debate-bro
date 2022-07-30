import { useRef, useState, useEffect } from "react"
import io from 'socket.io-client'



export default function useCall(uuid, socket,) {
    const [callConnected, setCallConnected] = useState(false)
    const [mediaDevicesSupported, setMediaDevicesSupported] = useState()
    const ourUuid = uuid
    const ourStream = useRef()
    const ourStreamRef = useRef()
    const theirStreamRef = useRef()
    const peerRef = useRef()
    const otherUser = useRef()

    useEffect(() => {
        if (socket != null) {
            console.log('call connection established')

            if (!navigator || navigator === undefined || navigator.mediaDevices === undefined) {
                console.log('navigator issue')
                //setEvents(events => [...events, 'media devices undefined!'])
                setMediaDevicesSupported(false)
            }
            else {
                import('peerjs').then(({ default: Peer }) => {
                    navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true,
                    }).then(stream => {
                        console.log("own stun server")
                        setMediaDevicesSupported(true)
                        peerRef.current = new Peer(ourUuid, {
                            config: {
                                iceServers: [
                                    {
                                        urls: ["stun:stun.debate-bro.com:5349", "stun:stun.debate-bro.com:3478"]
                                    },
                                    {
                                        urls: ["turn:turn.debate-bro.com:5349", "stun:stun.debate-bro.com:3478"],
                                        username: "turn",
                                        credential: 'nkdhynpqmsxsqk', //todo change when we move to production
                                    }]
                            }, debug: 3
                        });

                        function callUser(userId) {
                            setCallConnected(true)
                            const call = peerRef.current.call(userId, ourStream.current)
                            call.on('stream', userVideoStream => {
                                theirStreamRef.current.srcObject = userVideoStream
                            })
                            call.on('close', () => {
                                console.log('closed')
                            })

                            //peers[userId] = call
                        }


                        peerRef.current.on('call', call => {
                            setCallConnected(true)
                            call.answer(ourStream.current)
                            call.on('stream', userVideoStream => {
                                theirStreamRef.current.srcObject = userVideoStream
                            })
                        })


                        console.log('got ur media')
                        ourStream.current = stream
                        ourStreamRef.current.srcObject = stream;

                        socket.on('matched', (msg) => {
                            if (ourUuid == msg.parent) {
                                console.log('matched', msg)
                                otherUser.current = msg.child
                                callUser(msg.child)
                            }
                        })

                    });
                });
            }
        }
    }, [socket])


    return [callConnected, ourStreamRef, theirStreamRef]
}