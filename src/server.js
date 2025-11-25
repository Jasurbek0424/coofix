const app = require('./app');
const { PORT } = require('./core/config/env');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
