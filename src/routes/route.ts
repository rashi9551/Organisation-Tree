import { Router } from "express";
import Controller from "../controllers/controller";

const router=Router()

router.post('/createTree',Controller.createTree);


router.post('/createNode',Controller.createNode);


router.put('/updateNode/:id',Controller.updateNode); 


router.delete('/removeNode/:id',Controller.removeNode); 


router.get('/getTree',Controller.getTree);


export default router