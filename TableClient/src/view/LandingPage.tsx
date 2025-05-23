import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/buttons.css";
import "../style/landingPage.css";
import Popup from "../components/popups/Popup";
import Login from "../components/users/login/Login";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showPopupLogin, setShowPopupLogin] = useState(false);

  return (
    <div className="landingPage-container">

      <h1 className="text-7xl mb-20 font-bold mt-16">Tables</h1>

      <div className="p-12">
        <button
          className="loginLP text-2xl font-medium hover:font-bold"
          onClick={() => setShowPopupLogin(true)} 
        >
          Log in
        </button>
        {showPopupLogin && (
          <Popup onClose={() => setShowPopupLogin(false)}>
            <Login />
          </Popup>
        )}
        <p className="p-2 m-10 text-xl">or</p>
        <button
          className="RegisterFirst text-2xl font-medium hover:font-bold"
          onClick={() => {
            navigate(`/register`);
          }}
        >
          Sing up
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
