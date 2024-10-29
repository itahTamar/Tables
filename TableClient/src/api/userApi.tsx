// logout
import axios from "axios";
import Cookies from "js-cookie";

//register
export const register = async (
  serverUrl: string,
  userName: string,
  email: string,
  password: string
) => {
  try {
    if (!password || !userName || !email)
      throw new Error(
        "please provide a valid username and password to register"
      );
    const response = await axios.post(`${serverUrl}/api/users/register`, {
      userName,
      email,
      password,
    });
    console.log(
      "at user-api register response from server is:",
      response.data.ok
    );
    if (!response.data.ok) {
      alert(
        "At Register: This username is already exist, sign-in or choose a different username"
      );
      throw new Error(response.data);
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}; //work ok

//logIn
export const login = async (
  serverUrl: string,
  userName: string,
  email: string,
  password: string
) => {
  try {
    if (!userName || !password || !email)
      throw new Error("please provide a valid username and password to login");
    const response = await axios.post(
      `${serverUrl}/api/users/login`,
      { userName, email, password },
      { withCredentials: true }
    );
    console.log("at user-api login response from server is:", response);
    return response.data;

    //return "ok: true" from server and userID encoded in cookie
  } catch (error) {
    console.error(error);
  }
}; //work ok

//logOut
export const logout = () => {
  Cookies.remove("user");
  return true;
};

//get user high scores
//userId is in cookie
export const getUserHighScore = async (serverUrl: string) => {
  try {
    const result = await axios.get(`${serverUrl}/api/users/getUserHighScore`, {
      withCredentials: true,
    }); // get from server: { ok: true, highScore: userDB.highScore }
    console.log("at userApi/getUserHighScore the result:", result);
    if (!result)
      throw new Error(
        "at userApi/getUserHighScore there was no result from server"
      );
    console.log(
      "at userApi/getUserHighScore the result.data.highScore:",
      result.data.highScore
    );

    if (result.data.ok) return result.data.highScore;
  } catch (error) {
    console.error(error, "at userApi/getUserHighScore there was a catch error");
  }
};

export const recoveryEmail = async ({
  serverUrl,
  email,
}: {
  serverUrl: string;
  email: string;
}) => {
  try {
    if (!email) throw new Error("please provide a valid email");
    const recipient_email = email;
    console.log("at recoveryEmail the recipient_email is:", recipient_email);

    const response = await axios.post(
      `${serverUrl}/send_recovery_email`,
      { recipient_email },
      { withCredentials: true }
    );

    console.log("at recoveryEmail response from server is:", response);
    console.log(
      "at recoveryEmail response.data from server is:",
      response.data
    );
    console.log(
      "at recoveryEmail  response.data.ok from server is:",
      response.data.ok
    );

    if (!response.data.ok) {
      alert("Recovery Email Failed");
      throw new Error(response.data);
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}; //work ok

export const resetPassword = async ({
  serverUrl,
  email,
  password,
}: {
  serverUrl: string;
  email: string;
  password: string;
}) => {
  try {
    if (!password || !email)
      throw new Error("please provide a valid email and password to register");
    const response = await axios.post(
      `${serverUrl}/api/users/resetPassword`,
      { email, password },
      { withCredentials: true }
    );
    console.log(
      "at user-api resetPassword response from server is:",
      response.data.ok
    );
    if (!response.data.ok) {
      alert("at resetPassword -> reset password failed");
      throw new Error(response.data);
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}; //work ok

export const updateUserDetails = async ({
  serverUrl,
  userName,
  email,
  password,
}: {
  serverUrl: string;
  userName: string;
  email: string;
  password: string;
}) => {
  try {
    if (!password || !email || !userName)
      throw new Error(
        "please provide a valid userName, email and password to Update User Details"
      );
    console.log(
      "at UpdateUserDetails the userName, email & password are:",
      userName,
      email,
      password
    );
    const response = await axios.post(
      `${serverUrl}/api/users/UpdateUserDetails`,
      {
        userName,
        email,
        password,
      }
    );
    console.log(
      "at user-api resetPassword response from server is:",
      response.data.ok
    );
    if (!response.data.ok) {
      alert("at resetPassword -> reset password failed");
      throw new Error(response.data);
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}; //work ok