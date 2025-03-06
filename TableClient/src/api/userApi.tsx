// logout
import axios from "axios";
import Cookies from "js-cookie";

//register
export const register = async (
  serverUrl: string,
  email: string,
  password: string
) => {
  try {
    if (!password || !email)
      throw new Error(
        "please provide a valid username and password to register"
      );
    const response = await axios.post(`${serverUrl}/api/users/register`, {
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
  email: string,
  password: string
) => {
  try {
    if (!password || !email)
      throw new Error("please provide a valid username and password to login");
    const response = await axios.post(
      `${serverUrl}/api/users/login`,
      { email, password },
      { withCredentials: true }
    );
    console.log("at user-api login response from server is:", response);
    return response.data;

    //return "ok: true" from server and userID encoded in cookie
  } catch (error) {
    console.error(error);
    //if it's an Axios error with response data
    if (axios.isAxiosError(error) && error.response) {
      console.log("Server error response:", error.response.data);
      return { error: error.response.data.error }; // Get message from server
    }

    // General error
    return { error: "An unexpected error occurred. Please try again." };
  }
}; //work ok

//logOut
export const logout = () => {
  Cookies.remove("user");
  return true;
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
  email,
  password,
}: {
  serverUrl: string;
  email: string;
  password: string;
}) => {
  try {
    if (!password || !email)
      throw new Error(
        "please provide a valid userName, email and password to Update User Details"
      );
    console.log(
      "at UpdateUserDetails the userName, email & password are:",
      email,
      password
    );
    const response = await axios.post(
      `${serverUrl}/api/users/UpdateUserDetails`,
      {
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