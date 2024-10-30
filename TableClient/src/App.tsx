import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./router/router";
import { useState } from "react";
import { UserContext } from "./context/userContext";
// import { disableReactDevTools } from '@fvilers/disable-react-devtools' //add before prodction
import { ServerContext } from "./context/ServerUrlContext";
import { TableProvider } from "./context/tableContext";


let environment = import.meta.env.MODE;
const dev_server = import.meta.env.VITE_REACT_APP_SERVER_URL_DEV;
const prod_server = import.meta.env.VITE_REACT_APP_SERVER_URL_PROD;
const checkEnvironment =
  environment === "development" ? dev_server : prod_server;
// disableReactDevTools()

function App() {
  console.log("environment:", environment);
  console.log("dev_server:", dev_server);
  console.log("prod_server:", prod_server);
  console.log("checkEnvironment:", checkEnvironment);

  const [serverUrl] = useState<string>(checkEnvironment);
  console.log("serverUrl:", serverUrl);

  const [user, setUser] = useState<any>(null);
  const [email, setUserEmail] = useState<string>("");
 
  console.log(`Server URL: ${serverUrl}`); // Use serverUrl as needed in the API path
  return (
    <UserContext.Provider value={{ user, setUser, email, setUserEmail }}>
      <ServerContext.Provider value={serverUrl}>
        <TableProvider >
          <RouterProvider router={router} />
        </TableProvider>
      </ServerContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
