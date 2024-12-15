import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recoveryEmail } from "../../../api/userApi";
import { ServerContext } from "../../../context/ServerUrlContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const serverUrl = useContext(ServerContext);
  const navigate = useNavigate();

  const handleSubmitEmail = async (ev: React.FormEvent<HTMLFormElement>) => {
    try {
      ev.preventDefault();
      console.log("At handleSubmitEmail, the serverUrl is:", serverUrl);
      console.log("At handleSubmitEmail, the email:", email);
      if (!email) throw new Error("Reset password failed - no email");
      const response = await recoveryEmail({ serverUrl, email });
      if (!response) throw new Error("recoveryEmail failed from server");
      console.log("At handleSubmitEmail, the response from server:", response);
      const OTP = response.otp;
      navigate("/otpCode", { state: { email, OTP } });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-screen bottom-32 relative">
         <button
          className="absolute bottom-64 left-16"
          onClick={() => navigate("/")}
        >
          Back
        </button>

      <form className="relative top-24" onSubmit={handleSubmitEmail}>
        <div className="m-6">
          <label className="text-2xl">Please enter your Email</label>
          <div>
            <input
              className="border border-black m-2 rounded-2xl w-72 indent-4"
              type="email"
              name="email"
              autoComplete="given-email"
              value={email}
              onInput={(ev) => setEmail((ev.target as HTMLInputElement).value)}
            />
          </div>
        </div>
        <button className="login text-xl" type="submit">
          Send Reset Email
        </button>
      </form>
    </div>
  );
};
export default ForgotPassword;
