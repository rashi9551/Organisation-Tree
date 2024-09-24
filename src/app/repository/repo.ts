import { Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Node } from '../../entity/org-tree';
import { NodeData } from '../../interfaces/interface';

export default new class OrgTreeRepository {
    
    private nodeRepo: Repository<Node>;

    constructor() {
        this.nodeRepo = AppDataSource.getRepository(Node);
    }

    // Create a new node
    async createNode(nodeData: Partial<NodeData>): Promise<Node> {
        try {
            const node = this.nodeRepo.create(nodeData);
            return await this.nodeRepo.save(node);
        } catch (error) {
            console.error("Error creating node:", error);
            throw error; 
        }
    }


    async nodeExists(nodeId: number): Promise<boolean> {
        try {
            const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
            return !!node;
            
        } catch (error) {
            console.error("Error nodeExist checking node:", error);
            throw error; 
        }
    }

    async findNodeById(nodeId: number): Promise<Node | null> {
        try {
            const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
            return node;
        } catch (error) {
            console.error("Error getNode:", error);
            throw error;
        }
    }

    async findChildrenOfNode(parentId: number): Promise<Node[]> {
        try {
            // Find children nodes where parentId matches the given parentId
            return await this.nodeRepo.find({
                where: { parentId },
            });
        } catch (error) {
            console.error("Error finding children nodes:", error);
            throw new Error("Could not retrieve children nodes.");
        }
    }
    
    

    // Update an existing node
    async updateNode(updateData: Partial<Node>): Promise<Node | null> {
        try {
            // Fetch the node by ID
            const node = await this.nodeRepo.findOne({ where: { id: updateData.id } });
            if (!node) {
                console.error(`Node with ID ${updateData.id} not found`);
                return null; // Return null if the node doesn't exist
            }
    
            // Update the node with new data
            Object.assign(node, updateData);
    
            // Save the updated node back to the repository
            const savedNode = await this.nodeRepo.save(node);
            console.log('Node updated successfully:', savedNode);
            
            return savedNode; // Return the updated node
    
        } catch (error) {
            console.error('Error during node update:', error);
            throw new Error('Error updating node'); // Optionally re-throw the error for further handling
        }
    }
    

    // Remove a node with the option to either delete all children or shift them up
    async removeNode(nodeId: number, shiftChildren: boolean = false): Promise<void> {
        try {
            // Fetch the node along with its children
            const node = await this.nodeRepo.findOne({ where: { id: nodeId }, relations: ['children'] });
            if (!node) return; // If node doesn't exist, exit
    
            if (shiftChildren && node.children.length > 0) {
                // Shift child nodes one level up
                let parentColor = (await this.findNodeById(node.parentId)).color;

                for (const child of node.children) {
                    child.parentId = node.parentId; 
                    if (child.type === "location" || child.type === "department") {
                        parentColor = child.color; 
                    } else {
                        child.color = parentColor;
                    }
                    
                    await this.nodeRepo.save(child); // Save the updated child nodes
                }
            } else {
                for (const child of node.children) {
                    await this.removeNode(child.id, false);
                }
            }
    
            // Finally, remove the node itself
            await this.nodeRepo.remove(node);
        } catch (error) {
            console.error("Error during node removal in repository:", error);
            throw error; // Re-throw error to be handled at a higher level
        }
    }
    
    

    // Get the entire organization tree (or a subtree from a particular node)
    async getTree(rootNodeId?: number): Promise<Node[]> {
        try {
            if (rootNodeId) {
                const subtree = await this.nodeRepo.find({
                    where: { id: rootNodeId },
                    relations: ['children'],
                });
                return subtree;
            }
    
            const fullTree = await this.nodeRepo.find({
                where: { parent: null },
                relations: ['children'],
            });
            return fullTree;
        } catch (error) {
            console.error("Error fetching the tree:", error);
            throw error;
        }
    }

   
};
