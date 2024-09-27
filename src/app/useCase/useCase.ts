import { Node, NodeType } from "../../entity/org-tree";
import { StatusCode } from "../../interfaces/enum";
import { deleteData, NodeData, NodePromise, TreePromise } from "../../interfaces/interface";
import { buildTree } from "../../middleware/buildTree";
import Repo from "../repository/repo";

const colorPool = [
    "#F6AF8E", "#C3A5FF", "#B1D0A5", "#F6ED8E", 
    "#8EF4F6", "#C0F68E", "#F68ECB", "#8E97F6", 
    "#F68EAB", "#F6CE8E", "#DFF68E"
];

let lastAssignedColorIndex: number = 0; 

export default new class UseCase {
    
    createNode = async (nodeData: NodeData): Promise<NodePromise> => {
        try {
    
            // Validate node type
            if (!nodeData.type) {
                return { status: 400, message: "Node type is required." }; // Bad request
            }
    
            if (!Object.values(NodeType).includes(nodeData.type)) {
                return { status: 400, message: `Invalid node type. Allowed types are: ${Object.values(NodeType).join(', ')}.` };
            }
    
            // Find existing root node
            const existingRootNode = await Repo.findRootNode();
    
            // Ensure no child nodes are created without a root node
            if(!existingRootNode && nodeData.type !== NodeType.ORGANIZATION){
                return {
                    status: StatusCode.BadRequest as number,
                    message: "Cannot create child nodes without a root node (organization). Please create a root node first.",
                };
            }
    
            // Handle root node creation (no parent)
            if (!nodeData.parentId) {
                if (existingRootNode) {
                    return {
                        status: StatusCode.BadRequest as number,
                        message: "A root node already exists. Only one root node is allowed.",
                    };
                }
    
                nodeData.color = "white"; 
                const node = await Repo.createNode(nodeData);
                return { status: StatusCode.Created as number, node, message: "Root node created successfully" };
            }
    
            // Check if the parent node exists
            const parentExists = await Repo.nodeExists(nodeData.parentId);
            if (!parentExists) {
                return { status: StatusCode.NotFound as number, message: `Parent node with ID ${nodeData.parentId} does not exist.` };
            }
    
            // Logic to fetch the last created department or location node
            if (nodeData.type === NodeType.DEPARTMENT || nodeData.type === NodeType.LOCATION) {
                const latestNode = await Repo.findLatestNodeByType(); // Create a function to find the latest created department/location under the same parent
                console.log(latestNode,"ithu last node-=-=-=-=");
                
                if (latestNode) {
                    // Find the color of the latest node in the pool
                    const lastColor = latestNode.color;
                    const lastColorIndex = colorPool.indexOf(lastColor);
                    const nextColorIndex = (lastColorIndex + 1) % colorPool.length; // Get the next color from the pool in a cyclic manner
    
                    nodeData.color = colorPool[nextColorIndex];
                } else {
                    // No latest node found, use the next color from the global index
                    nodeData.color = colorPool[lastAssignedColorIndex];
                    lastAssignedColorIndex = (lastAssignedColorIndex + 1) % colorPool.length; // Increment the index, reset if it exceeds the pool length
                }
            } else {
                // For other nodes, inherit color from the parent node
                try {
                    const parentNode = await Repo.findNodeById(nodeData.parentId);
                    if (parentNode) {
                        nodeData.color = parentNode.color; // Inherit parent's color
                    } else {
                        throw new Error(`Parent node with ID ${nodeData.parentId} not found`);
                    }
                } catch (error) {
                    console.error("Error fetching parent node:", error);
                    throw error;
                }
            }
    
            // Create the node under the specified parent
            const node = await Repo.createNode(nodeData);
            return { status: StatusCode.Created as number, node, message: "Node created successfully" };
    
        } catch (error) {
            console.error("Error during node creation:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    };
    
    
    
    
    
    updateNode = async (nodeData: Partial<NodeData>): Promise<NodePromise> => {
        try {
            
            const node = await Repo.findNodeById(nodeData.id);
            if(node.id==node.parentId)return { status: StatusCode.BadRequest as number, message: "Updating this node's parent would create a cycle." };

            if (!node) return { status: StatusCode.NotFound as number, message: `Node with ID ${nodeData.id} does not exist.` };
            
    
            // Check for cycle if parent ID is being updated
            if (nodeData.parentId && nodeData.parentId !== node.parentId) {
                const isCycle = await this.checkForCycle(nodeData.id,nodeData.parentId);
                if (isCycle) {
                    return { status: StatusCode.BadRequest as number, message: "Updating this node's parent would create a cycle." };
                }
            }
    
            // Update node attributes
            if (nodeData.name) node.name = nodeData.name; 
            if (nodeData.type) node.type = nodeData.type; 
            
            // Option to move child nodes with the current node or shift them up
            if (nodeData.parentId && nodeData.parentId !== node.parentId) {
                if (nodeData.shiftChildren) {
                    if(node.type==="employee")await this.moveChildrenToNewParent(node.id, nodeData.parentId);
                } else if(!nodeData.shiftChildren) {
                    await this.shiftChildrenOneLevelUp(node.id,node.parentId);
                }
            }
            if(nodeData.parentId)node.parentId=nodeData.parentId
            
            // Save updated node in the database
            let parentColor = (await Repo.findNodeById(nodeData.parentId)).color;

            if (node.type == "location" || node.type == "department") {
                parentColor = node.color; 
                console.log(parentColor,"ithu parent =--=-=-=-=-");
            } else {
                node.color = parentColor;
            }
            const updatedNode = await Repo.updateNode(node);
            return { status: StatusCode.OK as number, node: updatedNode, message: "Node updated successfully." };
    
        } catch (error) {
            console.error("Error during node update:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error updating node." };
        }
    }



    removeNode = async (deleteData: deleteData): Promise<NodePromise> => {
        try {
            const node = await Repo.findNodeById(deleteData.id);
            if (!node) {
                return { status: StatusCode.NotFound as number, message: `Node with ID ${deleteData.id} does not exist.` };
            }
    
            // Prevent deleting the root node (organization)
            if (node.type === 'organization') {
                return { status: StatusCode.BadRequest as number, message: "Deleting the root node will deprecate the entire organization tree." };
            }
    
            // Remove node based on the condition of shifting children or not
            await Repo.removeNode(deleteData.id, deleteData.shiftChildren);
            const message = deleteData.shiftChildren 
                ? "Node removed and children shifted one level up." 
                : "Node and all child nodes removed successfully.";
                
            return { status: StatusCode.OK as number, message };
    
        } catch (error) {
            console.error("Error during node removal:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error removing node." };
        }
    };
    
    
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

    async checkForCycle(nodeId: number, newParentId: number): Promise<boolean> {
        // Step 1: Fetch all nodes
        const nodes = await Repo.getFullTree();
    
        // Step 2: Create a map of nodes for easy lookup
        const nodeMap = new Map<number, Node>();
        nodes.forEach(node => nodeMap.set(node.id, node));
    
        // Step 3: Check if newParentId is a descendant of nodeId
        const isDescendant = (currentNodeId: number | null): boolean => {
            if (currentNodeId === null) return false; // No parent
    
            const currentNode = nodeMap.get(currentNodeId);
            if (!currentNode) return false; // Node not found
    
            // If currentNodeId is the new parent, cycle detected
            if (currentNodeId === newParentId) {
                return true; // Cycle detected
            }
    
            // Recursively check the parent
            return isDescendant(currentNode.parentId);
        };
    
        // Step 4: Perform the check
        return isDescendant(nodeId); // Check if newParentId is a descendant of nodeId
    }
    
    

    private moveChildrenToNewParent = async (nodeId: number, newParentId: number) => {
        try {
            let parentColor = (await Repo.findNodeById(newParentId)).color; // Get color from the new parent node
            console.log(nodeId, newParentId, "Propagating color change");
    
            const children = await Repo.findChildrenOfNode(nodeId);
    
            for (const child of children) {
                if (child.type === "location" || child.type === "department") {
                    parentColor = child.color; // If child is a location or department, update parentColor
                } else {
                    child.color = parentColor; // Inherit the parent color
                }
    
                // Update the current child node with the new parent ID and color
                await Repo.updateNode({ ...child });
    
                // Recursively update child nodes if any children exist (for multi-level color propagation)
                const grandChildren = await Repo.findChildrenOfNode(child.id);
                if (grandChildren.length > 0) {
                    // Recursively propagate the color down to the next level
                    await this.moveChildrenToNewParent(child.id, child.id); // Use child's ID as the new parent ID
                }
            }
        } catch (error) {
            console.error("Error in moveChildrenToNewParent:", error);
            throw error; 
        }
    };
    
    
    private shiftChildrenOneLevelUp = async (nodeId: number, levelUpParentId: number) => {
        try {
            // Get the color of the new parent (levelUpParentId)
            let parentColor = (await Repo.findNodeById(levelUpParentId)).color;
            const children = await Repo.findChildrenOfNode(nodeId);
    
            for (const child of children) {
                if (child.type === "location" || child.type === "department") {
                    // Update parentColor to the current child color (location/department)
                    parentColor = child.color;
                } else if (child.type === "employee") {
                    // If it's an employee, propagate the current parent color
                    child.color = parentColor;
                }
    
                // Shift child to new parent (levelUpParentId) and update its color
                console.log(`Shifting child ${child.id} to parent ${levelUpParentId}`);
                await Repo.updateNode({ ...child, parentId: levelUpParentId });
    
                // Recursively propagate the color change to all descendants
                await this.updateDescendantColors(child.id, parentColor);
            }
        } catch (error) {
            console.error("Error in shiftChildrenOneLevelUp:", error);
            throw error; // Rethrow the error to handle at a higher level if necessary
        }
    };
    
    // This part is still within the same function but handles the recursive color propagation
    private updateDescendantColors = async (nodeId: number, parentColor: string) => {
        const children = await Repo.findChildrenOfNode(nodeId);
    
        for (const child of children) {
            if (child.type === "location" || child.type === "department") {
                parentColor = child.color;
            } else if (child.type === "employee") {
                child.color = parentColor;
            }
    
            // Update the child with the propagated color
            await Repo.updateNode({ ...child });
    
            // Recursively update the colors of its descendants
            await this.updateDescendantColors(child.id, parentColor);
        }
    };
    
    
    
    
   
}