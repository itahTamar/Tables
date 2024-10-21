import nodemailer from "nodemailer";

interface EmailOptions {
  recipient_email: string;
}

export function sendEmail({
  recipient_email,
}: EmailOptions): Promise<{ ok: boolean; otp: number; message: string }> {
  console.log("hi from sendEmail fun");
  const OTP = Math.floor(Math.random() * 9000 + 1000);
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: "PASSWORD RECOVERY CODE",
      html: `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <title>OTP Email</title>
            </head>
            <body>
            <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Translate Game Recovery Password</a>
                </div>
                <p style="font-size:1.1em">Hi,</p>
                <p>Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
                <h2 style="background: #00466a; margin: 0 auto; width: max-content;padding: 0 10px; color: #fff; 
                    border-radius: 4px;">${OTP}</h2>
                <p style="font-size:0.9em;">Regards,<br />Translate Game</p>
                <hr style="border:none; border-top:1px solid #eee" />
            </div>
            </div>
            </body>
            </html>`,
    };

    transporter.sendMail(mail_configs, (error, info) => {
      if (error) {
        console.log(error);
        return reject({ message: "An error has occurred" });
      }
      console.log("At sendEmail the resolve is:", {
        ok: true,
        otp: OTP,
        message: "Email sent successfully",
      });
      return resolve({
        ok: true,
        otp: OTP,
        message: "Email sent successfully",
      });
    });
  });
}
