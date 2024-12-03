import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/buttons.css";
import "../style/landingPage.css";
import Login from "./../components/login/Login";
import Popup from "./../components/Popup";
import {DocumentAPIWrapper} from "../api/docApi"
import { ServerContext } from "../context/ServerUrlContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showPopupLogin, setShowPopupLogin] = useState(false);
  const serverUrl = useContext(ServerContext);

  return (
      <div className="landingPage-container">
        <div className="tempDiv">
          <button className="m-4" onClick={() => {DocumentAPIWrapper.add(serverUrl,"users", { name: "John Doe", email: "johndoe@example.com" })}}>Add Doc</button>
          <button className="m-4">Delete Doc</button>
          <button className="m-4">Update Doc</button>
          <button className="m-4">Get Doc</button>
        </div>

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