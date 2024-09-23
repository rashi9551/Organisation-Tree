import {Response,Request} from 'express'
import { StatusCode } from '../interfaces/enum'


export default new class Controller{

    createTree=async(req:Request,res:Response)=>{
        try {
            const registerResponse={status:200}
           res.status(registerResponse?.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    createNode=async(req:Request,res:Response)=>{
        try {
            const registerResponse={status:200}
           res.status(registerResponse?.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    updateNode=async(req:Request,res:Response)=>{
        try {
            const registerResponse={status:200}
           res.status(registerResponse?.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    removeNode=async(req:Request,res:Response)=>{
        try {
            const registerResponse={status:200}
           res.status(registerResponse?.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    getTree=async(req:Request,res:Response)=>{
        try {
            const registerResponse={status:200}
           res.status(registerResponse?.status).json(registerResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }

}