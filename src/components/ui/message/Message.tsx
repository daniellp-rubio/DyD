import { IoClose, IoCloseCircle } from "react-icons/io5";

interface Props {
  title: string;
  message: string;
  onClose: () => void;
};

export function PopupMessage({ title, message, onClose }: Props) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-red-300 min-w-[320px] max-w-xs px-6 py-4 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          aria-label="Cerrar"
        >
          <IoClose size={20} />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <IoCloseCircle className="text-red-500 w-7 h-7" />
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        <div className="text-gray-700">{message}</div>
      </div>
    </div>
  );
};