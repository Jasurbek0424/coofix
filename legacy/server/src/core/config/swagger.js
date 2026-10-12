const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API",
      version: "1.0.0",
      description: "API documentation for construction e-commerce platform",
    },

        components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
    
    servers: [
      { url: "http://localhost:8000/api" },
      { url: "https://coofix-server.onrender.com/api" },
    ],
  },
  apis: [
    "./src/modules/*/*.routes.js",
    "./src/modules/*/*.controller.js",
    "./src/modules/*/*.model.js",
    "./src/routes.js"
  ],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at: http://localhost:8000/api-docs");
}

module.exports = swaggerDocs;
