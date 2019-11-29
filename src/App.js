import React from "react"
import Chatkit from "@pusher/chatkit-server";
import RoomList from "./components/RoomList"
import MessageList from "./components/MessageList"
import SendMessageForm from "./components/SendMessageForm"
import NewRoomForm from "./components/NewRoomForm"
import {tokenUrl, instanceLocator} from "./config"
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';

class App extends React.Component{

        constructor(){
            super()
            this.state = {
                roomId: null,
                messages: [],
                joinableRooms: [],
                joinedRooms: []
            }
            this.sendMessage = this.sendMessage.bind(this)
            this.subscribeRoom = this.subscribeRoom.bind(this)
            this.getRooms = this.getRooms.bind(this)
            this.createRoom = this.createRoom.bind(this)
        }

        componentDidMount() {
            const chatManager = new ChatManager({
                instanceLocator,
                userId:'Nami',
                tokenProvider: new TokenProvider({
                    url: tokenUrl
                })
                }
            )

            chatManager.connect()
                .then(currentUser => {
                    this.currentUser = currentUser
                    this.getRooms()


                })
                .catch(err => console.log("error on connecting", err))

        }

        getRooms(){

            this.currentUser.getJoinableRooms()
                .then(joinableRooms =>{
                    this.setState({
                        joinableRooms,
                        joinedRooms: this.currentUser.rooms
                    })
                })
                .catch(err => console.log("error on joinableRooms", err))
        }

        subscribeRoom(roomId){
            this.setState({messages:[]})
            this.currentUser.subscribeToRoom({
                roomId: roomId,
                hooks:{
                    onMessage: message =>{
                        this.setState({
                            messages: [...this.state.messages, message]
                        })

                    }
                }

            })
                .then( room=>{
                    this.setState(
                        {
                            roomId: room.id
                        }
                    )
                    this.getRooms()
                })
                .catch(err=> console.log('error on subscribing to room: ', err))
        }

        sendMessage(text){
            this.currentUser.sendMessage({
                text,
                roomId:this.state.roomId
            })
        }

        createRoom(name){
            this.currentUser.createRoom({
                name
            })
                .then(room => this.subscribeRoom(room.id))
                .catch(err => console("error creating a new room", err))

        }



    render(){
        return(
          <div className="app">

            <RoomList roomId={this.state.roomId} subscribeRoom = {this.subscribeRoom} rooms={[...this.state.joinableRooms, ...this.state.joinedRooms]} />
            <MessageList roomId = {this.state.roomId} messages = {this.state.messages}/>
            <SendMessageForm disable ={!this.state.roomId} sendMessage = {this.sendMessage}/>
            <NewRoomForm createRoom={this.createRoom}/>

          </div>
        )
      }
}

export default App;