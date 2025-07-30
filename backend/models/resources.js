const db = require('../db');

async function assignManager(resourceId, managerId) {
  await db('resources').where({ id: resourceId }).update({ manager_id: managerId });
}

module.exports = {
  assignManager,
};
