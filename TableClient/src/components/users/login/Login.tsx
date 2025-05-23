import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../style/buttons.css";
import { UserContext } from "../../../context/userContext";
import { ServerContext } from "../../../context/ServerUrlContext";
import { useGetAllUserTables } from "../../../hooks/tables/useGetTablesHooks";
import { TablesContext } from "../../../context/tableContext";
import { login } from "../../../api/userApi";

//work ok
const Login = () => {
  const navigate = useNavigate();
  const serverUrl = useContext(ServerContext);
  const getAllUserTables = useGetAllUserTables();
  const tableContext = useContext(TablesContext); 
  const { setUserEmail } = useContext(UserContext);
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  if (!tableContext) {
    throw new Error("TablesContext must be used within a TableProvider");
  }

  const handleSubmitLogin = async (ev: React.FormEvent<HTMLFormElement>) => {
    try {
      ev.preventDefault();
      console.log(
        "At handleSubmitLogin the email & password are:",
        email,
        password
      );
      const response = await login(serverUrl, email, password);
      if (!response) {
        window.alert(
          "login failed! check your username, email or password or please register first"
        );
        throw new Error("login failed from server!");
      }
      console.log("At handleSubmitLogin the response is:", response);

      setUserEmail(email);
      await getAllUserTables();
      navigate(`/mainTablesPage`);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleVisibility = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible((prevVisible) => {
      const newVisible = !prevVisible;
      if (newVisible) {
        const id = setTimeout(() => setVisible(false), 2000);
        //@ts-ignore
        setTimeoutId(id);
      }
      return newVisible;
    });
  };

  return (
    <div>
      <form className="relative top-24" onSubmit={handleSubmitLogin}>
        <h1 className="text-4xl pb-5">Welcome</h1>

        <div className="m-6">
          <label className="text-2xl">Please enter your Email</label>
          <div>
            <input
              className="border border-black m-2 rounded-2xl w-80 indent-4"
              type="email"
              name="email"
              autoComplete="given-email"
              value={email}
              onInput={(ev) => setEmail((ev.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        <div className="m-6">
          <label className="text-2xl">Please enter your Password</label>
          <div>
            <input
              className="border border-black m-2 rounded-2xl w-80 relative left-4 indent-4"
              type={visible ? "text" : "password"}
              name="password"
              autoComplete="off"
              value={password}
              onInput={(ev) =>
                setPassword((ev.target as HTMLInputElement).value)
              }
            ></input>
            <button
              type="button"
              className="emoji-button visible "
              onClick={() => toggleVisibility()}
            >
              <span className="emoji">&#128065;</span>
              {visible ? <span className="slash">/</span> : null}
            </button>
          </div>
        </div>

        <div>
          <a
            href="#"
            onClick={() => navigate("/forgotPassword")}
            className="text-gray-800"
          >
            {" "}
            Forgot Password?
          </a>
        </div>

        <button className="login text-xl" type="submit">
          Log in
        </button>
      </form>
    </div>
  );
};

export default Login;
