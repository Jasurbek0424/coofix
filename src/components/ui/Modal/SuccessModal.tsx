"use client";

import { Modal } from "./Modal";
import { Button } from "../Buttons/Button";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "Ваш заявка принята",
  message = "Спасибо за заявку! Мы свяжемся с вами в ближайщее время",
  buttonText = "НА ГЛАВНУЮ",
  onButtonClick,
}: SuccessModalProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      router.push("/");
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <div className="text-center space-y-6 text-foreground">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-foreground whitespace-pre-line">{message}</p>
        <Button
          variant="primary"
          fullWidth
          onClick={handleButtonClick}
          className="mt-6"
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}
