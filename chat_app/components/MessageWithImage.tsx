
import Modal from "react-modal";
import { useState, useEffect } from "react";
import { FixedImage } from "./FIxedImage";

export const MessageWithImage = ({currentUserId, Message}:{currentUserId:any, Message:any}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalImage, setModalImage] = useState("");
    
    const openModal = (image:any) => {
        setModalImage(image);
        setModalIsOpen(true);
    };
    const closeModal = () => {
        setModalIsOpen(false);
        setModalImage("");
    };
    useEffect(() => {
        if (modalIsOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [modalIsOpen]);
    return (
        <div>
            <button
                className={`relative text-sm shadow rounded-md ${Message.sender._id === currentUserId
                    ? "mr-3"
                    : "ml-3"}`}
                onClick={() => openModal(Message.file)}
            >
                <FixedImage
                    src={Message.file}
                    width={250}
                    height={250}
                    className="rounded-md"
                />
            </button>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Image Modal"
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
                overlayClassName="fixed inset-0 bg-black bg-opacity-75"
            >
                <div className="relative rounded-lg flex justify-center items-center overflow-auto" style={{ maxHeight: "100vh", maxWidth: "100vh" }}>
                    <div className="flex justify-center items-center">
                        <img src={modalImage} alt="Detailed View" className="object-contain max-h-full max-w-full mt-12" />
                    </div>
                </div>
            </Modal>

        </div>
        
    )
}