import { useState } from "react";
import Modal from "../components/Modal";


export default function Home() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-evenly">
          <h1 className="text-white text-5xl md:text-7xl">TIC TAC TOE</h1>
          <div className="flex flex-col items-center gap-10">
              <button className="bg-white w-42 h-12 text-lg md:text-xl" onClick={()=>setIsCreateModalOpen(true)}>Create a Room</button>
              <p className="text-white text-lg md:text-xl">-------- or --------</p>
              <button className="bg-white w-42 h-12 text-lg md:text-xl" onClick={()=>setIsJoinModalOpen(true)}>Join a Room</button>
          </div>
        <Modal isOpen={isCreateModalOpen}>
            <div className="w-full h-full flex justify-center items-center">
                 <h2 className="text-white">Loading...</h2> 
            </div>
        </Modal>  
        <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)}>
            <div className="w-full h-full flex justify-center items-center">
                 <h2 className="text-white">Loading...</h2> 
            </div>
        </Modal>  
      </div>
     
  )
}
