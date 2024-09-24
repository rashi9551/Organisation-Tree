import { Node, NodeType } from "../entity/org-tree";

export interface NodeData {
    id: number;
    name: string;
    type: NodeType;
    color: string;
    isWantToMove?:boolean;
    parentId: number;
    children?: NodeData[];
}


export interface NodePromise{
    status: number; 
    node?:Node;
    message?:string

}
export interface TreePromise{
    status: number; 
    tree?:Node[];
    message?:string

}