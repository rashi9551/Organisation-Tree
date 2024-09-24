import { Router } from "express";
import Controller from "../controllers/controller";

const router=Router()



router.post('/createNode',Controller.createNode);


router.put('/updateNode',Controller.updateNode); 


router.delete('/removeNode',Controller.removeNode); 


router.get('/getTree',Controller.getTree);


export default router