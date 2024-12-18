import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServerContext } from "../../../context/ServerUrlContext";
import { resetPassword } from "../../../api/userApi";

function ResetPassword() {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [match, setMatch] = useState(false);
  const [email, setEmail] = useState<string>("");
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

  const handleSubmitResetPassword = async (
    ev: React.FormEvent<HTMLFormElement>
  ) => {
    try {
      ev.preventDefault();
      console.log("At handleSubmitRegister, the serverUrl is:", serverUrl);
      if (password === confirmPassword) {
        const data = { email, password };
        if (!data) throw new Error("register failed - no email or password");
        const response = await resetPassword({ serverUrl, email, password });
        // const response = await register({userName, password});
        if (!response) throw new Error("register failed from server");
        alert("Password successfully set");
        navigate("/");
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
          onClick={() => navigate("/")}
        >
          Back
        </button>

        <form
          className="custom-form relative"
          onSubmit={handleSubmitResetPassword}
        >
        <h1 className="text-7xl mb-20 font-bold mt-16 text-black">Set a New Password</h1>

          <input
            className="border border-black m-2 rounded-2xl w-72 h-12 relative indent-4"
            type="email"
            name="email"
            autoComplete="given-name"
            placeholder="Enter your email" //must be uniq
            value={email}
            onInput={(ev) => setEmail((ev.target as HTMLInputElement).value)}
          />

          <div className="relative left-4">
            <input
              className="border border-black m-2 rounded-2xl w-72 h-12 relative indent-4"
              type={visible ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="off"
              placeholder="Choose your Password"
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
              placeholder="Enter your Password again"
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
            Save new password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;