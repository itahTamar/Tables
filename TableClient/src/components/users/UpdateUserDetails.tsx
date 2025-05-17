import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServerContext } from "../../context/ServerUrlContext";
import { UserContext } from "../../context/userContext";
import { updateUserDetails } from "../../api/userApi";

export default function UpdateUserDetails() {
  const {user} = useContext(UserContext) //get the userName from userContext
  const [newUserName, setNewUserName] = useState<string>(user);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [match, setMatch] = useState(false);
  const {email} = useContext(UserContext)
  const [newEmail, setNewEmail] = useState<string>(email);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const serverUrl = useContext(ServerContext);
  const navigate = useNavigate();

  const validate = () => {
    if (password == confirmPassword) {
      setMatch(true);
    } else {
      setMatch(false);
    }
  };

  const toggleVisibility = (type: "password" | "confirmPassword") => {
    if (timeoutId) clearTimeout(timeoutId);

    if (type === "password") {
      setVisible((prevVisible) => {
        if (!prevVisible) {
          const id = setTimeout(() => setVisible(false), 2000);
          //@ts-ignore
          setTimeoutId(id);
        }
        return !prevVisible;
      });
      setVisibleConfirm(false);
    } else if (type === "confirmPassword") {
      setVisibleConfirm((prevVisibleConfirm) => {
        if (!prevVisibleConfirm) {
          const id = setTimeout(() => setVisibleConfirm(false), 2000);
          //@ts-ignore
          setTimeoutId(id);
        }
        return !prevVisibleConfirm;
      });
      setVisible(false);
    }
  };

  useEffect(() => {
    validate();
  }, [confirmPassword, password]);

  const handleSubmitUpdateUserDetails = async (
    ev: React.FormEvent<HTMLFormElement>
  ) => {
    try {
      ev.preventDefault();
      // console.log("At handleSubmitUpdateUserDetails, the serverUrl is:", serverUrl);
      if (password === confirmPassword) {
        const data = { newUserName, newEmail, password };
        if (!data) throw new Error("update detail failed - no userName, email or password");
        const response = await updateUserDetails({ serverUrl, email: newEmail, password });
        if (!response) throw new Error("register failed from server");
        alert("User details updated successfully");
        navigate("/userPage");
      } else {
        alert("Passwords not match, please check it out");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="h-screen">
        <button
          className="absolute top-8 left-16"
          onClick={() => navigate("/mainTablesPage")}
        >
          Back
        </button>

        <form
          className="custom-form relative"
          onSubmit={handleSubmitUpdateUserDetails}
        >
          <h1 className="text-7xl mb-20 font-bold mt-16 text-black">
            Update Your Details
          </h1>

          <div className="">
            <div className="icon_container"></div>
            <input
              className="border border-black m-2 rounded-2xl w-72 h-12 relative indent-4"
              type="userName"
              name="userName"
              autoComplete="given-name"
              placeholder={user}
              value={newUserName}
              onInput={(ev) =>
                setNewUserName((ev.target as HTMLInputElement).value)
              }
            />
          </div>

          <input
            className="border border-black m-2 rounded-2xl w-72 h-12 relative indent-4"
            type="email"
            name="email"
            autoComplete="given-name"
            placeholder={email}
            value={newEmail}
            onInput={(ev) => setNewEmail((ev.target as HTMLInputElement).value)}
          />

          <div className="relative left-4">
            <input
              className="border border-black m-2 rounded-2xl w-72 h-12 relative indent-4"
              type={visible ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="off"
              placeholder="Password"
              value={password}
              onInput={(ev) =>
                setPassword((ev.target as HTMLInputElement).value)
              }
            ></input>
  
            <button
              type="button"
              className="emoji-button visible right-12"
              onClick={() => toggleVisibility("password")}
            >
              <span className="emoji">&#128065;</span>
              {visible ? <span className="slash">/</span> : null}
            </button>
          </div>

          <div className="relative left-4">
            <input
              className="border border-black m-2 rounded-2xl w-72 h-12 relative indent-4"
              type={visibleConfirm ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              name="confirmPassword"
              autoComplete="off"
              placeholder="Enter Password again"
              onInput={(ev) =>
                setConfirmPassword((ev.target as HTMLInputElement).value)
              }
            ></input>

            <button
              type="button"
              className="emoji-button visible right-12"
              onClick={() => toggleVisibility("confirmPassword")}
            >
              <span className="emoji">&#128065;</span>
              {visibleConfirm ? <span className="slash">/</span> : null}
            </button>
          </div>

          <p>{!match ? "password are not matched!" : null}</p>
          <button className="registerBtn text-xl" type="submit">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}