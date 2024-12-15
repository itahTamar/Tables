import "../style/popupWithAnimation.css";

interface PopupProps {
  onClose: () => void;
  children: React.ReactNode;
  open: boolean;
}

const PopupWithAnimation: React.FC<PopupProps> = ({ onClose, children, open }) => {
  return (
    <div className={`popup2 ${open ? "popup2-open" : ""}`}>
      <div className="popup2-inner">
        <button className="close2" onClick={onClose}>
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default PopupWithAnimation;
