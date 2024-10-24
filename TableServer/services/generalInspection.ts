import jwt from "jwt-simple";

export function checkCookieValid(req: any){
    try {
         //get user id from cookie
    const someID: string = req.cookies.id; //unique id. get the user id from the cookie - its coded!
    if (!someID)
      throw new Error("At generalInspection checkCookieValid: userID not found in cookie");
        console.log("At checkCookieValid the userID from cookies: ", { someID }); //work ok
    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("At generalInspection checkCookieValid: Couldn't load secret from .env");
    const decodedId = jwt.decode(someID, secret);
      console.log("At generalInspection checkCookieValid the decodedUserId:", decodedId); //work ok
    return decodedId
    } catch (error) {
      console.error(error);
    }
}