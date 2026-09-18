import type { ReactNode } from "react"

interface ModalProps{
    isOpen: boolean,
    onClose?: () => void,
    children: ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) {
        return null;
    }
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="w-70 md:w-84 h-70 md:h-84 rounded-xl bg-[#181818] backdrop-blur-3xl p-6" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}
