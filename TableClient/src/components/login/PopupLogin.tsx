import Login from "./Login";
import "../../style/popup.css"
interface PopupLoginProps {
    onClose: () => void;
  }
  
  const PopupLogin: React.FC<PopupLoginProps> = ({ onClose }) => {
    return (
      <div className="popup">
        <div className="popup-inner">
          <button className="close" onClick={onClose}>X</button>
          <Login />
        </div>
      </div>
    );
  };
  
  export default PopupLogin;