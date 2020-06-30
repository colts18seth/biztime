const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const invoiceRoutes = new express.Router();

invoiceRoutes.get("/", async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT id, comp_code FROM invoices`
        );
        return res.json({ invoices: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

invoiceRoutes.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        const results = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id=$1`, [id]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`Code: "${id}" doesn't exist`, 404);
        }

        const company = await db.query(
            `SELECT code, name, description FROM companies WHERE code=$1`, [results.rows[0].comp_code]
        );

        return res.json({
            invoice: {
                id: results.rows[0].id,
                amt: results.rows[0].amt,
                paid: results.rows[0].paid,
                add_date: results.rows[0].add_date,
                paid_date: results.rows[0].paid_date,
                company: company.rows[0]
            }
        });
    }
    catch (err) {
        return next(err);
    }
});

invoiceRoutes.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );

        return res.status(201).json({ invoice: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

invoiceRoutes.put("/:id", async (req, res, next) => {
    try {
        const { amt } = req.body;
        const results = await db.query(
            `UPDATE invoices SET amt=$2
            WHERE id=$1
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [req.params.id, amt]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`Code: "${code}" doesn't exist`, 404);
        }

        return res.status(200).json({ invoices: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

invoiceRoutes.delete("/:id", async (req, res, next) => {
    try {
        const results = await db.query(
            `DELETE FROM invoices
            WHERE id=$1`,
            [req.params.id]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`Code: "${code}" doesn't exist`, 404);
        }

        return res.status(200).json({ status: "Deleted" });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = invoiceRoutes;