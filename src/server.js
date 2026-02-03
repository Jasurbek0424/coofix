const app = require('./app');
const { PORT } = require('./core/config/env');
const swaggerDocs = require('./core/config/swagger');

swaggerDocs(app);
console.log("Gemini key:", process.env.GEMINI_API_KEY?.slice(0, 6));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
