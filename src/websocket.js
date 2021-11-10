class WebSocketService {

    static instance = null
    callbacks = {}
    static getInstance(){
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    constructor(){
        this.socketRef = null;
    }

    connect(){
        const path = 'ws://127.0.0.1:8000/ws/chat/test/';
        this.socketRef = new WebSocket(path);
        this.socketRef.onopen = () => {
            console.log('Web Socket Open');
        };

        this.socketNewMessage(JSON.stringify({message:{command:'fetch_messages'}}))
        
        this.socketRef.onmessage = e => {
            this.socketNewMessage(e.data)
        }
        this.socketRef.onerror = e => {
            console.error(e.message);
        }
        this.socketRef.onclose = e => {
            console.log('Web Socket is closed');
            this.connect();
        }
    }

    socketNewMessage(data){
        const parsedData = JSON.parse(data);
        const command = parsedData.message.command;
        if (Object.keys(this.callbacks).length === 0) {
            return;
        }
        if(command === 'messages'){
            this.callbacks[command](parsedData.message.messages)
        }
        if(command === 'new_message'){
            this.callbacks[command](parsedData.message.message)
        }
    }

    fetchMessages(username){
        console.log('FETCH MESSAGES');
        console.log(username);
        console.log('-------------------------');
        this.sendMessage({command:'fetch_messages', username: 'jcambron'})
    }

    newChatMessage(message){
        console.log('NEW CHAT MESSAGE');
        console.log(message);
        console.log('-------------------------');
        this.sendMessage({command:'new_message', from: message.from, message: message.content})
    }

    addCallbacks(messagesCallback, newMessageCallback){
        this.callbacks['messages'] = messagesCallback;
        this.callbacks['new_message'] = newMessageCallback;
    }

    sendMessage(data){
        try {
            this.socketRef.send(JSON.stringify({...data}))
        } catch (error) {
            console.error(err.message);
        }
    }

    state(){
        return this.socketRef.readyState;
    }

    waitForSocketConnection(callback){
        const socket = this.socketRef;
        const recursion = this.waitForSocketConnection;
        setTimeout(
            function(){
                if (socket.readyState===1){
                    console.log('connection is secure');
                    if(callback !=null){
                        callback();
                    }
                    return;
                } else {
                    console.log('waiting for connection....');
                    recursion(callback);
                }
            }, 1)
    }

}

const WebSocketInstance = WebSocketService.getInstance();
export default WebSocketInstance;