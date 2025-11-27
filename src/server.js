const app = require('./app');
const { PORT } = require('./core/config/env');
const swaggerDocs = require('./core/config/swagger');

swaggerDocs(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
