import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./router/router";
import { useEffect, useState } from "react";
import { UserContext } from "./context/userContext";
import { disableReactDevTools } from '@fvilers/disable-react-devtools' //add before prodction
import { ServerContext } from "./context/ServerUrlContext";
import { TableProvider } from "./context/tableContext";
import {
  startServerWakeManager,
  stopServerWakeManager,
} from "../src/utils/serverWakeManager";
import { logout } from "./api/userApi";

let environment = import.meta.env.MODE;
const dev_server = import.meta.env.VITE_REACT_APP_SERVER_URL_DEV;
const prod_server = import.meta.env.VITE_REACT_APP_SERVER_URL_PROD;
const checkEnvironment =
  environment === "development" ? dev_server : prod_server;
disableReactDevTools()

function App() {
  console.log("environment:", environment);
  console.log("dev_server:", dev_server);
  console.log("prod_server:", prod_server);
  console.log("checkEnvironment:", checkEnvironment);

  const [serverUrl] = useState<string>(checkEnvironment);
  console.log("serverUrl:", serverUrl);
  // Wakeup function to App.tsx to wake up the server with first entering the site
  useEffect(() => {
    fetch(serverUrl, { mode: "no-cors" }).catch(() => {});
  }, [serverUrl]);

  const [user, setUser] = useState<any>(null);
  const [email, setUserEmail] = useState<string>("");
  const isLoggedIn = Boolean(email);
  console.log("user in App:", email);
  console.log("isLoggedIn:", isLoggedIn);
  useEffect(() => {
    if (isLoggedIn) {
      startServerWakeManager(serverUrl, () => {
        logout();
        setUserEmail("");
        router.navigate("/");
      });
    } else {
      stopServerWakeManager();
    }
  }, [isLoggedIn, serverUrl]);
 
  console.log(`Server URL: ${serverUrl}`); // Use serverUrl as needed in the API path
  return (
    <UserContext.Provider value={{ user, setUser, email, setUserEmail }}>
      <ServerContext.Provider value={serverUrl}>
        <TableProvider  key={Math.random()}>
          <RouterProvider router={router} />
        </TableProvider>
      </ServerContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
