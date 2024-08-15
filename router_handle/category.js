const db = require('../db/index')

exports.getCategory = (req, res) => {
    const sql = `
        SELECT 
            mc.mc_id AS mcId,
            mc.mc_name AS mcName,
            sc.sc_id AS scId,
            sc.sc_name AS scName,
            sc.descr AS descr
        FROM category sc
        JOIN category mc ON sc.mc_id = mc.mc_id
        ORDER BY mc.mc_id, sc.sc_id;
    `;

    db.query(sql, (err, results) => {
        if (err) return res.send(err);

        const categoryList = [];
        const categoryMap = new Map();

        results.forEach(row => {
            const { mcId, mcName, scId, scName, descr } = row;

            // Check if main category is already in the map
            if (!categoryMap.has(mcId)) {
                categoryMap.set(mcId, {
                    mcName,
                    mcId,
                    scList: []
                });
                categoryList.push(categoryMap.get(mcId));
            }

            // Add sub-category if it doesn't exist yet
            const category = categoryMap.get(mcId);
            const existingSc = category.scList.find(sc => sc.scId === scId);
            if (!existingSc) {
                category.scList.push({
                    scName,
                    scId,
                    descr
                });
            }
        });

        res.send({
            status: 200,
            message: '获取分类成功',
            data: categoryList
        });
    });
};

