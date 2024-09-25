// swagger/swaggerOptions.ts
const swaggerOptions = {
  openapi: "3.0.3",
  info: {
    title: "Node API",
    version: "1.0.0",
    description: "API documentation for creating a node.",
  },
  servers: [
    {
      url: "http://localhost:3000", // Your backend URL
    },
  ],
  paths: {
    "/api/createNode": {
      post: {
        summary: "Create a new node",
        description:
          "Creates a new node with a specified type, name, and parent ID.",
        tags: ["Node"],
        requestBody: {
          description: "Node creation payload",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    example: "organization",
                    description:
                      "The type of the node (e.g., organization, department, employee).",
                  },
                  name: {
                    type: "string",
                    example: "IGotSkill",
                    description: "The name of the node.",
                  },
                  parentId: {
                    type: "integer",
                    example: null,
                    description: "The ID of the parent node.",
                  },
                },
                required: ["type", "name", "parentId"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Node created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      example: 1,
                      description: "The ID of the newly created node.",
                    },
                    type: {
                      type: "string",
                      example: "employee",
                      description: "The type of the newly created node.",
                    },
                    name: {
                      type: "string",
                      example: "amras",
                      description: "The name of the newly created node.",
                    },
                    parentId: {
                      type: "integer",
                      example: 1,
                      description: "The ID of the parent node.",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid input",
          },
          "500": {
            description: "Server error",
          },
        },
      },
    },
    "/api/getTree": {
      get: {
        summary: "Retrieve the node tree",
        description: "Returns the entire hierarchical structure of nodes.",
        tags: ["Node"],
        responses: {
          "200": {
            description: "Successfully retrieved the node tree",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 200,
                    },
                    tree: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "integer",
                            description: "The unique identifier of the node.",
                            example: 1,
                          },
                          name: {
                            type: "string",
                            description: "The name of the node.",
                            example: "alter",
                          },
                          type: {
                            type: "string",
                            description:
                              "The type of the node (e.g., organization, department, employee).",
                            example: "organization",
                          },
                          color: {
                            type: "string",
                            description: "The color associated with the node.",
                            example: "white",
                          },
                          parentId: {
                            type: "integer",
                            description:
                              "The ID of the parent node, if applicable.",
                            example: null,
                          },
                          children: {
                            type: "array",
                            description: "List of child nodes.",
                            items: {
                              type: "object",
                              properties: {
                                id: {
                                  type: "integer",
                                  description:
                                    "The unique identifier of the child node.",
                                    example:2,
                                },
                                name: {
                                  type: "string",
                                  description: "The name of the child node.",
                                  example:"rashid"
                                },
                                type: {
                                  type: "string",
                                  description: "The type of the child node.",
                                  example:"employee"
                                },
                                color: {
                                  type: "string",
                                  description:
                                    "The color associated with the child node.",
                                    example:"white"
                                },
                                parentId: {
                                  type: "integer",
                                  description: "The ID of the parent node.",
                                  example:1
                                },
                                children: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      id: {
                                        type: "integer",
                                      },
                                      name: {
                                        type: "string",
                                      },
                                      type: {
                                        type: "string",
                                      },
                                      parentId: {
                                        type: "integer",
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    message: {
                      type: "string",
                      example: "Tree fetched successfully",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 500,
                    },
                    message: {
                      type: "string",
                      example: "Error when fetching tree",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/updateNode": {
      put: {
        summary: "Update an existing node",
        description:
          "Updates the attributes of a node, including its parent ID and options to shift child nodes.",
        tags: ["Node"],
        requestBody: {
          description: "Node update payload",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    example: 4,
                    description: "The ID of the node to update.",
                  },
                  parentId: {
                    type: "integer",
                    example: 1,
                    description: "The ID of the new parent node.",
                  },
                  shiftChildren: {
                    type: "boolean",
                    example: false,
                    description:
                      "Whether to move child nodes with the current node or shift them up.",
                  },
                },
                required: ["id"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Node updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 200,
                    },
                    node: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 8,
                        },
                        name: {
                          type: "string",
                          example: "suhail",
                        },
                        type: {
                          type: "string",
                          example: "employee",
                        },
                        parentId: {
                          type: "integer",
                          example: 1,
                        },
                        color: {
                          type: "string",
                          example: "white",
                        },
                      },
                    },
                    message: {
                      type: "string",
                      example: "Node updated successfully.",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid input or cycle detected",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 400,
                    },
                    message: {
                      type: "string",
                      example:
                        "Updating this node's parent would create a cycle.",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Not Found - Node does not exist",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 404,
                    },
                    message: {
                      type: "string",
                      example: "Node with ID 8 does not exist.",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 500,
                    },
                    message: {
                      type: "string",
                      example: "Error updating node.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/removeNode": {
      delete: {
        summary: "Remove an existing node",
        description:
          "Removes a node by its ID, with an option to shift its children.",
        tags: ["Node"],
        requestBody: {
          description: "Node removal payload",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    example: 2,
                    description: "The ID of the node to remove.",
                  },
                  shiftChildren: {
                    type: "boolean",
                    example: false,
                    description: "Whether to shift child nodes up one level.",
                  },
                },
                required: ["id"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Node removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "Node and all child nodes removed successfully.",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid operation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 400,
                    },
                    message: {
                      type: "string",
                      example:
                        "Deleting the root node will deprecate the entire organization tree.",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Not Found - Node does not exist",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 404,
                    },
                    message: {
                      type: "string",
                      example: "Node with ID 6 does not exist.",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 500,
                    },
                    message: {
                      type: "string",
                      example: "Error removing node.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerOptions;
