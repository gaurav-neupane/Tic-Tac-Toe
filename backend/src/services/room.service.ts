import { Player, RoomState } from "../types/game";

export async function createNewRoom(roomState: RoomState) {
  const token = crypto.randomUUID();
  const player: Player = Math.random() < 0.5 ? "O" : "X";
  if (player === "O") {
    roomState.players.O = token;
  } else {
    roomState.players.X = token;
  }
  return {
    roomState,
    token,
    player,
  };
}

export async function joinExistingRoom(roomState: RoomState, existingToken? : string) {
  //Room entering logic
  // Check whether the room is full
  // If not check which player is assignable and assign it
    // if a room already exists with state let them enter with token
    if (existingToken) {
        if (roomState.players.X === existingToken) {
            return {
                roomState,
                token: existingToken,
                player: "X" as Player
            };
        }

        if (roomState.players.O === existingToken) {
            return {
                roomState,
                token: existingToken,
                player: "O" as Player
            }
        }
        
        return {
            error: "Invalid token"
        };
    }
    if (roomState.players.O === null) {
      const token = crypto.randomUUID();
      roomState.players.O = token;
      return {
        roomState,
        token,
        player: "O" as Player,
      };
    }

    if (roomState.players.X === null) {
      const token = crypto.randomUUID();
      roomState.players.X = token;
      return {
        roomState,
        token,
        player: "X" as Player,
      };
    }
     
    return {
        error: "Room is full"
    };

}
