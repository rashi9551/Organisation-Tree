import {Response,Request} from 'express'
import { StatusCode } from '../../interfaces/enum'
import useCase from '../useCase/useCase'
import { NodeData } from '../../interfaces/interface'

export default new class Controller{

    createNode=async(req:Request,res:Response)=>{
        try {
            console.log("node creating...");
            const nodeData=req.body
            const registerResponse=await useCase.createNode(nodeData)
           res.status(registerResponse.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    updateNode=async(req:Request,res:Response)=>{
        try {
            console.log("updating...");
            const registerResponse=await useCase.updateNode(req.body)
           res.status(registerResponse.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    removeNode=async(req:Request,res:Response)=>{
        try {
            console.log("removing...");
            const registerResponse=await useCase.removeNode(req.body)
           res.status(registerResponse.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    getTree=async(req:Request,res:Response)=>{
        try {
            console.log("geeting tree...");
            const registerResponse=await useCase.getTree()
           res.status(registerResponse.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }

}