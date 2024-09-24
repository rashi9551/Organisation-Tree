import { Node } from "../../entity/org-tree";
import { StatusCode } from "../../interfaces/enum";
import { NodeData, NodePromise } from "../../interfaces/interface";
import Repo from "../repository/repo";

const colorPool = [
    "#F6AF8E", "#C3A5FF", "#B1D0A5", "#F6ED8E", 
    "#8EF4F6", "#C0F68E", "#F68ECB", "#8E97F6", 
    "#F68EAB", "#F6CE8E", "#DFF68E"
];

let lastAssignedColorIndex: { [key: number]: number } = {}; // Tracks last color index for each parent node



export default new class UseCase {
    
    createNode = async (nodeData: NodeData): Promise<NodePromise> => {
        try { 
            
            if (!nodeData.type) {
                return { status: 400, message: "Node type is required." }; // Bad request
            }

            // Case for root node creation (no parent)
            if (!nodeData.parentId) {
                nodeData.color = "white"; // Default color for root
                const node = await Repo.createNode(nodeData);
                return { status: StatusCode.Created as number, node, message: "Root node created successfully" };
            }
    
            // Check if the parent node exists
            const parentExists = await Repo.nodeExists(nodeData.parentId);
            if (!parentExists) {
                return { status: StatusCode.NotFound as number, message: `Parent node with ID ${nodeData.parentId} does not exist.` };
            }
    
            // Check for cycles
            const hasCycle = await this.checkForCycle(nodeData.parentId, nodeData);
            if (hasCycle) {
                return { status: StatusCode.BadRequest as number, message: "Cycle detected: cannot create this node under the specified parent." };

            }

            if (nodeData.type === "location" || nodeData.type === "department") {
                const lastIndex = lastAssignedColorIndex[nodeData.parentId] || -1;
                const newColorIndex = (lastIndex + 1) % colorPool.length;
                nodeData.color = colorPool[newColorIndex];
                lastAssignedColorIndex[nodeData.parentId] = newColorIndex; // Update the last used color index
    
                // Propagate color to all children of the new node
                await this.propagateColorToChildren(nodeData);
            } else {
                nodeData.color = "white"; // Default color for other nodes
            }
    
    
            // Create the node under the specified parent
            const node = await Repo.createNode(nodeData);
            return { status: StatusCode.Created as number, node, message: "Node created successfully" };
    
        } catch (error) {
            console.error("Error during node creation:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }

    async checkForCycle(newParentId: number, nodeData: NodeData): Promise<boolean> {
        try {
            // Get the current node's parent (if exists) for cycle checking
            const currentNode = await Repo.findNodeById(nodeData.parentId);
            if (!currentNode) return false; 
        
            // Check if the new parent ID is in the descendants of the current node
            return await this.hasDescendant(currentNode, newParentId);
        } catch (error) {
            console.error("Error checking for cycle:", error);
            throw new Error("Error during cycle check"); 
        }
    }
    
    private async hasDescendant(node: Node, parentId: number): Promise<boolean> {
        try {
            if (node.parentId === parentId) return true; // Found the parent in the chain
    
            for (const child of node.children) {
                const hasChildDescendant = await this.hasDescendant(child, parentId);
                if (hasChildDescendant) {
                    return true; 
                }
            }
    
            return false; // ParentId not found in the descendants
        } catch (error) {
            console.error("Error checking descendants:", error);
            throw new Error("Error during descendant check"); 
        }
    }

    async propagateColorToChildren(parentNodeData: NodeData): Promise<void> {
        const children = await Repo.findChildrenOfNode(parentNodeData.id);
        for (const child of children) {
            if (child.type === "location" || child.type === "department") {
                child.color = parentNodeData.color; // Propagate parent's color to child
                await Repo.updateNodeColor(child.id, child.color); // Update the node's color in the database
            }
            await this.propagateColorToChildren(child); // Recursively propagate color
        }
    }
    
    


    updateNode = async (): Promise<null > => {
        try {
           
            return null
        } catch (error) {
            console.error("Error during registration:", error);
            return null
        }
    }
    removeNode = async (): Promise<null > => {
        try {
           
            return null
        } catch (error) {
            console.error("Error during registration:", error);
            return null
        }
    }
    getTree = async (): Promise<null > => {
        try {
           
            return null
        } catch (error) {
            console.error("Error during registration:", error);
            return null
        }
    }
   
}