import "../../style/popups/popupWithAnimation.css";

interface PopupProps {
  onClose: () => void;
  children: React.ReactNode;
  open: boolean;
}

const PopupWithAnimation: React.FC<PopupProps> = ({ onClose, children, open }) => {
  return (
    <div className={`popup2 ${open ? "popup2-open" : ""}`}>
      <div className="popup2-inner">
        <button className="close2" onClick={()=>{
          console.log("❌ Close clicked!");
          onClose();}}>
            X
        </button>
        {children}
        </div>
    </div>
  );
};

export default PopupWithAnimation;
