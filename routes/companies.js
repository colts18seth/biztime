const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const companyRoutes = new express.Router();

companyRoutes.get("/", async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT * FROM companies`
        );

        return res.json({ companies: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

companyRoutes.get("/:code", async (req, res, next) => {
    try {
        const code = req.params.code
        const results = await db.query(
            `SELECT * FROM companies WHERE code=$1`, [code]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`Code: "${code}" doesn't exist`, 404);
        }

        return res.json({ company: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

companyRoutes.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        );

        return res.status(201).json({ company: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = companyRoutes;