import { useRef, useState } from "react";
import Modal from "../components/Modal";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";


export default function Home() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
    const roomCodeRef = useRef<HTMLInputElement>(null);
    
    const navigate = useNavigate();
    async function createRoom() {
        setIsCreateModalOpen(true);
        try {
            const response = await axios.post("http://localhost:8787/room/create");
            const { roomCode, token } = response.data;
            console.log(roomCode);
            console.log(token);
            localStorage.setItem("playerToken", token);
            localStorage.setItem("roomCode", roomCode);
            navigate('/game');    
        } catch (error) {
            console.log(error);
        } finally {
            setIsCreateModalOpen(false);
        }
    }

    async function joinRoom() {
        setIsCreateModalOpen(true);
        const roomCode = roomCodeRef.current?.value.trim().toUpperCase();
        const savedRoomCode = localStorage.getItem("roomCode");
        const savedToken = localStorage.getItem("playerToken")
        if (!roomCode) {
            toast.error("Please enter a room code");
            return;
        }
        if(roomCode.length !== 6) {
            toast.error("Room code must be 6 characters");
            return;
        }
        if (savedRoomCode === roomCode && savedToken) {
            navigate('/game');
        }
        try {
            const response = await axios.post(`http://localhost:8787/room/${roomCode}/join`)
            const { token } = response.data;
            localStorage.setItem("playerToken", token);
            localStorage.setItem("roomCode", roomCode);
            navigate('/game')
        } catch (error) {
            console.log(error);
        } finally {
            setIsCreateModalOpen(false);
        }

    };
  return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-evenly">
          <h1 className="text-white text-5xl md:text-7xl">TIC TAC TOE</h1>
          <div className="flex flex-col items-center gap-10">
              <button className="bg-white w-42 h-12 text-lg md:text-xl active:scale-95 hover:scale-105" onClick={createRoom}>Create a Room</button>
              <p className="text-white text-lg md:text-xl">-------- or --------</p>
              <button className="bg-white w-42 h-12 text-lg md:text-xl active:scale-95 hover:scale-105" onClick={()=>setIsJoinModalOpen(true)}>Join a Room</button>
          </div>
        <Modal isOpen={isCreateModalOpen}>
            <div className="w-full h-full flex justify-center items-center">
                 <h2 className="text-white">Loading...</h2> 
            </div>
        </Modal>  
        <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)}>
            <div className="w-full h-full flex flex-col justify-center items-center gap-4">
                  <h2 className="text-white text-lg md:text-xl">Enter the code to join room:</h2>
                  <input ref={roomCodeRef} type='text' placeholder="eg. WX12YZ34" className="w-56 md:w-60 text-lg bg-white text-center p-2"></input>
                  <button className="bg-[#303030] w-56 md:w-60 p-2 text-lg text-white border-[#494949] border-2 active:scale-95 hover:scale-105" onClick={joinRoom}>Join</button>
            </div>
        </Modal>  
      </div>
     
  )
}
