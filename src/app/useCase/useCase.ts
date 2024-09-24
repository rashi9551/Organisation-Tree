import { Node, NodeType } from "../../entity/org-tree";
import { StatusCode } from "../../interfaces/enum";
import { NodeData, NodePromise, TreePromise } from "../../interfaces/interface";
import { buildTree } from "../../middleware/buildTree";
import Repo from "../repository/repo";

const colorPool = [
    "#F6AF8E", "#C3A5FF", "#B1D0A5", "#F6ED8E", 
    "#8EF4F6", "#C0F68E", "#F68ECB", "#8E97F6", 
    "#F68EAB", "#F6CE8E", "#DFF68E"
];

let lastAssignedColorIndex: number = 0; // Tracks the last color index globally

export default new class UseCase {
    
    createNode = async (nodeData: NodeData): Promise<NodePromise> => {
        try { 
            if (!nodeData.type) {
                return { status: 400, message: "Node type is required." }; // Bad request
            }

            if (!Object.values(NodeType).includes(nodeData.type)) {
                return { status: 400, message: `Invalid node type. Allowed types are: ${Object.values(NodeType).join(', ')}.` };
            }

            // Case for root node creation (no parent)
            if (!nodeData.parentId) {
                nodeData.color = "white"; // Default color for root node
                const node = await Repo.createNode(nodeData);
                return { status: StatusCode.Created as number, node, message: "Root node created successfully" };
            }

            // Check if the parent node exists
            const parentExists = await Repo.nodeExists(nodeData.parentId);
            if (!parentExists) {
                return { status: StatusCode.NotFound as number, message: `Parent node with ID ${nodeData.parentId} does not exist.` };
            }

            // Assign color for location or department nodes
            if (nodeData.type === "location" || nodeData.type === "department") {
                nodeData.color = colorPool[lastAssignedColorIndex]; // Assign the next color from the pool
                console.log(lastAssignedColorIndex,colorPool[lastAssignedColorIndex]);
                lastAssignedColorIndex++; // Increment the color index

                // Reset the color index if it exceeds the pool length
                if (lastAssignedColorIndex >= colorPool.length) {
                    lastAssignedColorIndex = 0;
                }
            } else {
                // For other nodes, inherit color from the parent node
                const parentNode = await Repo.findNodeById(nodeData.parentId);
                nodeData.color = parentNode.color; // Inherit parent's color
            }

            // Create the node under the specified parent
            const node = await Repo.createNode(nodeData);
            return { status: StatusCode.Created as number, node, message: "Node created successfully" };

        } catch (error) {
            console.error("Error during node creation:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }

    async checkForCycle(nodeId: number, newParentId: number): Promise<boolean> {
        const descendants: number[] = [];
    
        // Recursive function to get all descendants of a node
        async function getChildren(parentId: number): Promise<void> {
            try {
                const children = await Repo.findChildrenOfNode(parentId); // Fetch direct children of the current node
                for (const child of children) {
                    descendants.push(child.id); // Add child ID to descendants list
                    await getChildren(child.id); // Recursively get children of this child
                }
            } catch (error) {
                console.error(`Error fetching children of node ${parentId}:`, error);
                throw new Error(`Error fetching descendants for node ${parentId}`);
            }
        }
    
        try {
            await getChildren(nodeId); // Start finding descendants from the given nodeId

            // After collecting descendants, check if newParentId is in descendants
            if (descendants.includes(newParentId)) {
                return true; // A cycle would be created
            } else {
                return false; // No cycle detected
            }
        } catch (error) {
            console.error(`Error fetching descendants for node ${nodeId}:`, error);
            throw new Error(`Failed to retrieve all descendants for node ${nodeId}`);
        }
    }
    
    
    
    updateNode = async (nodeData: Partial<NodeData>): Promise<NodePromise> => {
        try {
            
            const node = await Repo.findNodeById(nodeData.id);
            if(node.id==node.parentId)return { status: StatusCode.BadRequest as number, message: "Updating this node's parent would create a cycle." };

            if (!node) return { status: StatusCode.NotFound as number, message: `Node with ID ${nodeData.id} does not exist.` };
            
    
            // Check for cycle if parent ID is being updated
            if (nodeData.parentId && nodeData.parentId !== node.parentId) {
                const isCycle = await this.checkForCycle(nodeData.id, nodeData.parentId);
                if (isCycle) {
                    return { status: StatusCode.BadRequest as number, message: "Updating this node's parent would create a cycle." };
                }
            }
    
            // Update node attributes
            if (nodeData.name) node.name = nodeData.name; 
            if (nodeData.type) node.type = nodeData.type; 
            
            // Option to move child nodes with the current node or shift them up
            if (nodeData.parentId && nodeData.parentId !== node.parentId) {
                if (nodeData.isWantToMove) {
                    await this.moveChildrenToNewParent(node.id, nodeData.parentId);
                } else if(!nodeData.isWantToMove) {
                    await this.shiftChildrenOneLevelUp(node.id,node.parentId);
                }
            }
            if(nodeData.parentId)node.parentId=nodeData.parentId
            
            // Save updated node in the database
            const updatedNode = await Repo.updateNode(node);
            return { status: StatusCode.OK as number, node: updatedNode, message: "Node updated successfully." };
    
        } catch (error) {
            console.error("Error during node update:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error updating node." };
        }
    }
    

    private moveChildrenToNewParent = async (nodeId: number, newParentId: number) => {
        console.log(nodeId,newParentId,"ithu change aaakendey");
        const children = await Repo.findChildrenOfNode(nodeId);
        for (const child of children) {            
            await Repo.updateNode({ ...child, parentId: newParentId });
        }
    };

    // Example function to shift children one level up (you'll need to implement this)
    private shiftChildrenOneLevelUp = async (nodeId: number, levelUpParentId: number) => {
        // Find direct children of the current node
        const children = await Repo.findChildrenOfNode(nodeId);
        
        // Update each child's parent to the "levelUpParentId" (the node's parent)
        for (const child of children) {
            console.log(`Shifting child ${child.id} to parent ${levelUpParentId}`);
            await Repo.updateNode({ ...child, parentId: levelUpParentId })
        }
    };
    
    
    removeNode = async (): Promise<null > => {
        try {
           
            return null
        } catch (error) {
            console.error("Error during registration:", error);
            return null
        }
    }
    getTree = async (): Promise<TreePromise > => {
        try {
           const getFullTree:Node[]=await Repo.getTree()
            const tree=buildTree(getFullTree)
           return { status: StatusCode.OK as number, tree, message: "Tree fetched succes fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
   
}