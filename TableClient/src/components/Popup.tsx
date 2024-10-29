import "../style/popup.css"

interface PopupProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ onClose, children }) => {
  return (
    <div className="popup">
      <div className="popup-inner">
        <button className="close" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Popup;