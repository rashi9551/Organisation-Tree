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
    async updateNode( updateData: Partial<Node>): Promise<Node | null> {
        const node = await this.nodeRepo.findOne({ where: { id: updateData.id } });
        if (!node) return null;
        Object.assign(node, updateData);

        // Save the updated node back to the repository
        const savedNode = await this.nodeRepo.save(node);
        console.log("?????",updateData,"ithu updated data"); // Log the saved node and updated node
        return savedNode;
        
    }

    // Remove a node with the option to either delete all children or shift them up
    async removeNode(nodeId: number, shiftChildren: boolean = false): Promise<void> {
        const node = await this.nodeRepo.findOne({ where: { id: nodeId }, relations: ['children'] });
        if (!node) return;

        if (shiftChildren) {
            // Shift child nodes one level up
            for (const child of node.children) {
                child.parentId = node.parentId; 
                await this.nodeRepo.save(child);
            }
        } else {
            // Remove all child nodes along with the current node
            for (const child of node.children) {
                await this.removeNode(child.id, false); // Recursive removal of child nodes
            }
        }

        await this.nodeRepo.remove(node); 
    }

    // Get the entire organization tree (or a subtree from a particular node)
    async getTree(rootNodeId?: number): Promise<Node[]> {
        if (rootNodeId) {
            // Get a specific subtree starting from the rootNodeId
            return await this.nodeRepo.find({
                where: { id: rootNodeId },
                relations: ['children'],
            });
        }

        // Get the entire organization tree (assuming the root node has no parent)
        return await this.nodeRepo.find({
            where: { parent: null },
            relations: ['children'],
        });
    }



   
};
