import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ServerContext } from "../../../context/ServerUrlContext";
import { recoveryEmail } from "../../../api/userApi";

const OTPInput: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timerCount, setTimer] = useState<number>(60);
  const [OTPinput, setOTPinput] = useState<number[]>([0, 0, 0, 0]);
  const [disable, setDisable] = useState<boolean>(true);
  const serverUrl = useContext(ServerContext);

  // Access email and OTP from location.state
  const { email, OTP } = location.state || {}; // Destructure with fallback to avoid undefined

  useEffect(() => {
    if (!email || !OTP) {
      // If email or OTP is missing, navigate back to the previous page
      navigate("/forgotPassword");
    }
  }, [email, OTP, navigate]);

  //resend the OTP code
  async function resendOTP() {
    if (disable) return;
    const response = await recoveryEmail({ serverUrl, email });
    if (!response) throw new Error("recoveryEmail failed from server");
    const OTP = response.otp;
    // setDisable(true)
    // alert("A new OTP has successfully been sent to your email.")
    // setTimer(60)
    navigate("/otpCode", { state: { email, OTP } });
  }

  function verifyOTP() {
    if (parseInt(OTPinput.join("")) === OTP) {
      navigate("/resetPassword");
    } else {
      alert(
        "The code you have entered is not correct, try again or re-send the link"
      );
    }
  }

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((lastTimerCount) => {
        lastTimerCount <= 1 && clearInterval(interval);
        if (lastTimerCount <= 1) setDisable(false);
        if (lastTimerCount <= 0) return lastTimerCount;
        return lastTimerCount - 1;
      });
    }, 1000); // Each count lasts for a second
    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [disable]);

  return (
    <div>
      <div>
        <h2 className="font-semibold text-3xl">Email Verification</h2>
        <p className="flex flex-row text-sm font-medium text-gray-400">
          We have sent a code to your email: {email}.
        </p>
      </div>

      <div>
            <form>
              <div className="flex flex-col space-y-16">
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                  {[0, 1, 2, 3].map((index) => (
                    <div className="w-16 h-16" key={index}>
                      <input
                        maxLength={1}
                        className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        type="text"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const newOTPinput = [...OTPinput];
                          newOTPinput[index] = value;
                          setOTPinput(newOTPinput);
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col space-y-5">
                  <div>
                    <a
                      onClick={verifyOTP}
                      className="flex flex-row cursor-pointer items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm"
                    >
                      Verify Account
                    </a>
                  </div>

                  <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn't receive code?</p>
                    <a
                      className="flex flex-row items-center"
                      style={{
                        color: disable ? "gray" : "blue",
                        cursor: disable ? "none" : "pointer",
                        textDecorationLine: disable ? "none" : "underline",
                      }}
                      onClick={resendOTP}
                    >
                      {disable ? `Resend OTP in ${timerCount}s` : "Resend OTP"}
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>

    </div>
  );
};

export default OTPInput;