# Tables project

## instalation:
1. [Install Node.js](https://nodejs.org/en)
2. Verify installation
   - open new terminal or PowerShell and verify versions
   - node -v
   - npm -v
  
   - if not found check in powershell path: &env:PATH
   - look for C:\Program Files\nodejs\
   - if not exist add it to windows PATH
   - verify you have PowerShell profile script
   - in power shell run: Test-Path $PROFILE
   - if False run (Create a PowerShell profile): New-Item -Path $PROFILE -ItemType File -Force
   - Open the profile in Notepad: notepad $PROFILE
   - Add this line to the file: $env:PATH += ";C:\Program Files\nodejs\;C:\Users\Amir\AppData\Roaming\npm"
   - Open PowerShell as Administrator and run: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
3. install backend packeges
   - npm init (will create packge json file)
   - npm i typescript
   - npx tsc
   - npm i express
   - npm i cookie-parser
   - npm i dotenv
   - npm i cors
   - npm i mongoose
4. run: npm run dev
5. install client side:
   - npm install
   - npm install axios
   - npm i react-router-dom
   - npm i dotenv
   - npm i --save-dev @types/js-cookie
6. run: npm run dev
 


