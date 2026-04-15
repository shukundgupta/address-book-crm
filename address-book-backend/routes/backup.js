const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {

  const fileName = `backup_${Date.now()}.sql`;
  const filePath = path.join(__dirname, '../', fileName);

  const command = `mysqldump -u root address_book_db > ${filePath}`;

  exec(command, (error) => {
    if (error) {
      return res.status(500).json({ message: 'Backup failed' });
    }

    res.download(filePath, fileName, () => {
      fs.unlinkSync(filePath);
    });
  });

});

module.exports = router;