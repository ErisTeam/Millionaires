package main

import (
	"database/sql"
	"math/rand"

	"millionairesServer/protobufMessages"
	"time"

	websocket_fasthttp "github.com/fasthttp/websocket"
	"github.com/gofiber/contrib/websocket"
	"google.golang.org/protobuf/proto"
)

type WebSocketClientState struct {
	inCall      bool
	target      *Snowflake
	callTimeout *time.Timer

	connection *websocket.Conn
}

func (s *WebSocketClientState) resetCall() {
	s.inCall = false
	s.target = nil
	s.stopTimeout()
	s.callTimeout = nil
}
func (s *WebSocketClientState) stopTimeout() {
	if s.callTimeout != nil {
		s.callTimeout.Stop()
	}
}

type ClientMapType = map[Snowflake]*WebSocketClientState
type WebSocketClientManager struct {
	clients ClientMapType

	dbConnection *sql.DB
}

func (c *WebSocketClientManager) GetClientByConnection(conn *websocket.Conn) (Snowflake, *WebSocketClientState) {
	for id, client := range c.clients {
		if client.connection == conn {
			return id, client
		}
	}
	return Snowflake{}, nil
}
func (c *WebSocketClientManager) GetClientsIdsInConnection() [](Snowflake) {
	var res []Snowflake = make([]Snowflake, 0)
	for id, client := range c.clients {
		if client.connection != nil {
			res = append(res, id)
		}
	}
	return res
}
func (c *WebSocketClientManager) GetRandomClient() (Snowflake, *WebSocketClientState) {
	keys := make([]Snowflake, 0, len(c.clients))
	for s := range c.clients {
		keys = append(keys, s)
	}
	randomIndex := rand.Intn(len(keys))
	randomKey := keys[randomIndex]
	return randomKey, c.clients[randomKey]
}

// TODO: return error on infinite loop
func (c *WebSocketClientManager) GetRandomClientExcludeSlice(exclude []Snowflake) (Snowflake, *WebSocketClientState) {
	randomKey, state := c.GetRandomClient()
	for _, s := range exclude {
		if s == randomKey {
			return c.GetRandomClientExcludeSlice(exclude)
		}
	}
	return randomKey, state
}
func (c *WebSocketClientManager) getRandomClientExcludeFunc(exclude func(Snowflake, *WebSocketClientState) bool) (Snowflake, *WebSocketClientState) {
	var randomKey, state = c.GetRandomClient()

	var excluded = make([]Snowflake, 0)
	for !exclude(randomKey, state) {
		excluded = append(excluded, randomKey)
		if len(excluded) == len(c.clients) {
			return Snowflake{}, nil
		}
		randomKey, state = c.GetRandomClientExcludeSlice(excluded)
	}

	return randomKey, state
}

func WebsocketRun(c *websocket.Conn) {
	var (
		mt  int
		msg []byte
		err error
	)

	// c.SetReadDeadline()

	var clientManager = c.Locals("clientManager").(*WebSocketClientManager)

	indentifyTimer := time.NewTimer(time.Second * 10)
	go func() {
		<-indentifyTimer.C
		println("Identify timeout")

		err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "Identify timeout"))
		if err != nil {
			println("write: ", err.Error())
		}

	}()
	closed := make(chan bool)
	const heartBeatInterval = time.Second * 30
	const heartBeatMiliseconds = int64(heartBeatInterval / time.Millisecond)
	const heartBeatTimerValue = time.Duration(float32(heartBeatInterval) * 1.7)
	heartBeatTimer := time.NewTicker(heartBeatTimerValue)
	go func() {
		for {
			select {
			case <-closed:
				return

			case <-heartBeatTimer.C:
				c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "Heartbeat timeout"))
				return
			}
		}
	}()

	c.SetCloseHandler(func(code int, text string) error {
		println("close: ", code, text)
		for s, c2 := range clientManager.clients {
			if c2.connection == c {
				delete(clientManager.clients, s)
				break
			}
		}
		closed <- true
		err := c.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(code, text), time.Now().Add(time.Second*5))
		if err != nil {
			println("write: ", err.Error())
		}
		return nil
	})

	noIdentifiedResponse, err := websocket_fasthttp.NewPreparedMessage(websocket.CloseMessage, websocket_fasthttp.FormatCloseMessage(websocket.CloseNormalClosure, "Invalid run id"))
	if err != nil {
		println("proto: ", err.Error())
		c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "Failed to prepare error message"))

		return
	}

	for {
		if mt, msg, err = c.ReadMessage(); err != nil {
			println("read: ", err.Error())
			break
		}
		if mt == websocket.PingMessage {
			c.WriteControl(websocket.PongMessage, msg, time.Now().Add(time.Second*5))
			continue
		}

		protoMsg := &protobufMessages.WebsocketMessage{}
		if err := proto.Unmarshal(msg, protoMsg); err != nil {
			println("proto: ", err.Error())
			break
		}
		switch protoMsg.Type {
		case protobufMessages.MessageType_Heartbeat:
			logger.Println("Heartbeat Received")
			heartBeatTimer.Reset(heartBeatTimerValue)
			msg, err := proto.Marshal(&protobufMessages.WebsocketMessage{Type: protobufMessages.MessageType_HeartbeatResponse})
			if err != nil {
				println("proto: ", err.Error())
				return
			}
			c.WriteMessage(websocket.BinaryMessage, msg)
		case protobufMessages.MessageType_Identify:
			indentifyTimer.Stop()

			heartBeatTimer.Reset(heartBeatTimerValue)

			msg := protoMsg.GetIdentify()
			if msg == nil {
				c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseUnsupportedData, "no data"))
				return
			}

			runId, err := snowflakeFromString(msg.RunSnowflakeId)
			if err != nil {
				println("proto: ", err.Error())
				c.WritePreparedMessage(noIdentifiedResponse)

				break
			}

			logger.Println("Identifying client with run id: ", runId.RawSnowflake)
			row := clientManager.dbConnection.QueryRow("SELECT ended FROM runs WHERE snowflake_id = ?", runId.RawSnowflake)

			var ended bool

			if row.Scan(&ended) != nil {
				println("Run not found", runId.StringIDDec())
				c.WritePreparedMessage(noIdentifiedResponse)

				break
			}
			if ended {
				println("proto: ", "Run ended")
				c.WritePreparedMessage(noIdentifiedResponse)

				break
			}

			logger.Println("Identified client with run id: ", runId)

			clientState := new(WebSocketClientState)
			clientState.inCall = false
			clientState.connection = c
			clientState.target = nil
			clientManager.clients[runId] = clientState

			response, err := proto.Marshal(&protobufMessages.WebsocketMessage{Type: protobufMessages.MessageType_Identify, Payload: &protobufMessages.WebsocketMessage_IdentifyResponse{IdentifyResponse: &protobufMessages.IdentifyResponsePayload{HeartbeatInterval: int32(heartBeatMiliseconds)}}})
			if err != nil {
				println("proto: ", err.Error())
				return
			}
			c.WriteMessage(websocket.BinaryMessage, response)

		case protobufMessages.MessageType_StartCall:
			println("recv: ", "StartCall")
			var currentId, currentClient = clientManager.GetClientByConnection(c)

			if currentClient == nil {
				println("recv: ", "StartCall: No client found")
				c.WritePreparedMessage(noIdentifiedResponse)
				break
			}
			msg := &protobufMessages.WebsocketMessage{Type: protobufMessages.MessageType_Error}
			if currentClient.inCall {

				msg.Payload = &protobufMessages.WebsocketMessage_Error{Error: &protobufMessages.ErrorPayload{Message: "Already in call"}}
				response, err := proto.Marshal(msg)
				if err != nil {
					println("proto: ", err.Error())
					return
				}
				c.WriteMessage(websocket.BinaryMessage, response)
				break
			}
			if len(clientManager.clients) == 1 {
				msg.Payload = &protobufMessages.WebsocketMessage_Error{Error: &protobufMessages.ErrorPayload{Message: "No other clients"}}
				response, err := proto.Marshal(msg)
				if err != nil {
					println("proto: ", err.Error())
					return
				}
				c.WriteMessage(websocket.BinaryMessage, response)
				break
			}

			var targetId, targetState = clientManager.getRandomClientExcludeFunc(func(s Snowflake, state *WebSocketClientState) bool {
				if s == currentId {
					return false
				}
				if state.inCall {
					return false
				}
				return true
			})

			if targetState == nil {
				for id, state := range clientManager.clients {
					if currentId != id {
						targetId = id
						targetState = state
						break
					}
				}
			}
			currentClient.target = &targetId
			targetState.target = &currentId
			currentClient.inCall = true
			targetState.inCall = true

			var callerName string
			var calleeName string
			rows, err := clientManager.dbConnection.Query("SELECT snowflake_id,name FROM runs WHERE snowflake_id = ? OR snowflake_id = ?", currentId.RawSnowflake, targetId.RawSnowflake)
			if err != nil {
				println("db: ", err.Error())
				return
			}
			for rows.Next() {
				var snowflakeId string
				var name string
				if err := rows.Scan(&snowflakeId, &name); err != nil {
					println("db: ", err.Error())
					return
				}
				if snowflakeId == currentId.StringIDDec() {
					callerName = name
				} else {
					calleeName = name
				}
			}

			msg = &protobufMessages.WebsocketMessage{Type: protobufMessages.MessageType_IncomingCall}
			msg.Payload = &protobufMessages.WebsocketMessage_IncomingCall{IncomingCall: &protobufMessages.IncomingCallPayload{CallerName: callerName}}

			response, err := proto.Marshal(msg)
			if err != nil {
				println("proto: ", err.Error())
				return
			}

			targetState.connection.WriteMessage(websocket.BinaryMessage, response)

			msg.Type = protobufMessages.MessageType_CallServerResponse
			msg.Payload = &protobufMessages.WebsocketMessage_CallServerResponse{CallServerResponse: &protobufMessages.CallServerResponsePayload{CalleeName: calleeName}}

			response, err = proto.Marshal(msg)
			if err != nil {
				println("proto: ", err.Error())
				return
			}
			c.WriteMessage(websocket.BinaryMessage, response)

			currentClient.callTimeout = time.NewTimer(time.Second * 15)
			go func() {
				<-currentClient.callTimeout.C
				if currentClient.inCall {
					currentClient.resetCall()
					targetState.resetCall()

					msg := &protobufMessages.WebsocketMessage{Type: protobufMessages.MessageType_EndCall}
					response, err := proto.Marshal(msg)
					if err != nil {
						println("proto: ", err.Error())
						return
					}
					currentClient.connection.WriteMessage(websocket.BinaryMessage, response)
					targetState.connection.WriteMessage(websocket.BinaryMessage, response)

				}
			}()

		case protobufMessages.MessageType_CallResponse:
			println("recv: ", "IncomingCallResponse")

			msg := protoMsg.GetCallResponse()
			var _, currentClient = clientManager.GetClientByConnection(c)
			if currentClient == nil {
				println("recv: ", "IncomingCallResponse: No client found")
				c.WritePreparedMessage(noIdentifiedResponse)
				break
			}
			logger.Println("Call response: ", msg.Accepted)

			var target = clientManager.clients[*currentClient.target]
			if target == nil {
				println("recv: ", "IncomingCallResponse: No target found")
				errorMsg := &protobufMessages.WebsocketMessage{Type: protobufMessages.MessageType_Error, Payload: &protobufMessages.WebsocketMessage_Error{Error: &protobufMessages.ErrorPayload{Message: "No target found"}}}

				response, err := proto.Marshal(errorMsg)
				if err != nil {
					println("proto: ", err.Error())
					return
				}

				c.WriteMessage(websocket.BinaryMessage, response)

				currentClient.resetCall()

				msg.Accepted = false
			} else {
				target.stopTimeout()

				response, err := proto.Marshal(msg)
				if err != nil {
					println("proto: ", err.Error())
					return
				}

				target.connection.WriteMessage(websocket.BinaryMessage, response)
			}

		case protobufMessages.MessageType_Message:
			println("recv: ", protoMsg.GetMessage().Message)

			var _, currentClient = clientManager.GetClientByConnection(c)
			if currentClient == nil {
				println("recv: ", "Message: No client found")
				c.WritePreparedMessage(noIdentifiedResponse)
				break
			}
			if currentClient.target == nil {
				println("")

				response := protobufMessages.WebsocketMessage{Type: protobufMessages.MessageType_Error}
				response.Payload = &protobufMessages.WebsocketMessage_Error{Error: &protobufMessages.ErrorPayload{
					Message: "Not in a call",
				}}

				binary, err := proto.Marshal(&response)
				if err != nil {
					println("proto: ", err.Error())
					return
				}
				c.WriteMessage(websocket.BinaryMessage, binary)
				break
			}
			targetConnection := clientManager.clients[*currentClient.target].connection

			binary, err := proto.Marshal(protoMsg)
			if err != nil {
				println("proto: ", err.Error())
				return
			}

			targetConnection.WriteMessage(websocket.BinaryMessage, binary)
			c.WriteMessage(websocket.BinaryMessage, binary)
		}

	}
	closed <- true

}
