import React, { useState } from "react";
import Modal from "react-modal";
import "./index.css";
Modal.setAppElement("#root");

interface CustomModalProps {
  isOpen: boolean;
  children?: React.ReactNode;
  className?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  children,
  className,
}) => {
  const [isDestroy, setIsDestroy] = useState(false);
  //模态框打开后创建元素
  const handleAfterOpen = () => {
    setIsDestroy(false);
  };
  //模态框关闭后销毁内部元素
  const handleAfterClose = () => {
    setIsDestroy(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      closeTimeoutMS={250}
      onAfterClose={handleAfterClose}
      onAfterOpen={handleAfterOpen}
      contentLabel="Custom Modal"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-50 select-none"
      className={`rounded-md shadow-md outline-none ${className}`}
    >
      {isDestroy ? null : children}
    </Modal>
  );
};

export default CustomModal;
