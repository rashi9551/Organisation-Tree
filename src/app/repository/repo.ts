import { Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Node, NodeType } from '../../entity/org-tree';
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

            const childernOfNodes= await this.nodeRepo.find({
                where: { parentId },
            });
            
            return childernOfNodes
        
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
            return savedNode; // Return the updated node
    
        } catch (error) {
            console.error('Error during node update:', error);
            throw new Error('Error updating node'); // Optionally re-throw the error for further handling
        }
    }
    

    async removeNode(nodeId: number, shiftChildren: boolean = false): Promise<void> {
        try {
            const node = await this.nodeRepo.findOne({ where: { id: nodeId }, relations: ['children'] });
            if (!node) return;
    
            if (shiftChildren && node.children.length > 0) {
                let parentColor = (await this.findNodeById(node.parentId)).color;
    
                for (const child of node.children) {
                    // Shift the child node to the node's parent
                    child.parentId = node.parentId;
    
                    // If the child is a location or department, update the parentColor
                    if (child.type === "location" || child.type === "department") {
                        parentColor = child.color; 
                    } else if (child.type === "employee") {
                        // If the child is an employee, inherit the parentColor
                        child.color = parentColor;
                    }
    
                    // Save the updated child node
                    await this.nodeRepo.save(child);
    
                    // Recursively propagate color changes to the child's descendants
                    await this.updateDescendantColors(child.id, parentColor);
                }
            } else {
                // If shiftChildren is false, remove all child nodes recursively
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


    private async updateDescendantColors(nodeId: number, parentColor: string): Promise<void> {
        const children = await this.nodeRepo.find({ where: { parentId: nodeId } });
    
        for (const child of children) {
            if (child.type === "location" || child.type === "department") {
                parentColor = child.color; 
            } else if (child.type === "employee") {
                child.color = parentColor;
            }
    
            // Save the updated child node
            await this.nodeRepo.save(child);
    
            // Recursively propagate color changes to its descendants
            await this.updateDescendantColors(child.id, parentColor);
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

    async findRootNode(): Promise<Node | null> {
        try {
            const rootNode = await this.nodeRepo.findOne({
                where: {
                    parentId: null,  // Root node will have no parent
                    type: NodeType.ORGANIZATION,  // Use the enum value for 'organization'
                },
            });
            return rootNode;
        } catch (error) {
            console.error("Error finding root node:", error);
            throw new Error("Unable to find root node.");
        }
    }
    
    

   
};
