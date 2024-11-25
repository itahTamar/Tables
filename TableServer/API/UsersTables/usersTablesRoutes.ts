import  express  from 'express';
import { addUsersTable, deleteUserTable, getAllUsersTables } from './usersTablesControllers';
const router = express.Router();

router
.post('/addUsersTable/:userID',addUsersTable)
.post('/getAllUsersTables',getAllUsersTables)
.delete('/deleteUserTable/:TableID',deleteUserTable)


export default router;