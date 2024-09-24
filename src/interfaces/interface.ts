import { Node, NodeType } from "../entity/org-tree";

export interface NodeData {
    id: number;
    name: string;
    type: NodeType;
    color: string;
    parentId: number;
    children?: NodeData[];
}


export interface NodePromise{
    status: number; 
    node?:Node;
    message?:string

}