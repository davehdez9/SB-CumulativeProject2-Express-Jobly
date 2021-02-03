"use strict"

/** Routes for Jobs */

const jsonschema = require("jsonschema")
const express = require("express")

const { BadRequestError } = require("../expressError")
const { ensureAdmin, ensureLoggedIn } = require("../middleware/auth")
const Job = require("../models/jobs")

// Schemas
const jobNewSchema = require("../schemas/jobNew.json")
const jobUpdateSchema = require("../schemas/jobUpdate.json")
const jobSearchSchema = require("../schemas/jobSearch.json")

const router = new express.Router()

/**
 * POST / { job } => { job }
 * 
 * job should be { title, salary, equity, company_handle }
 * 
 * Return { id, title, salary, equity, company_handle }
 * 
 * Authorization required: Admin 
*/

router.post("/", ensureAdmin, async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }

        const job = await Job.create(req.body)
        return res.status(201).json({job})
    } catch (error) {
        return next(error)
    }
})

/**
 * GET / =>
 *  { jobs: [ { id, title, salary, equity, company_handle }, ...] }
 * 
 * Can filter on provide search filters:
 * - title
 * - minSalary
 * - hasEquity
 * 
 * Authorization Required: None
*/

router.get("/", async function(req, res, next) {
    const query  = req.query

    //Convert the queryString into an integer to be validate on the schema as a Number
    if(query.minSalary !== undefined){
        query.minSalary = +query.minSalary
    }
    query.hasEquity = query.hasEquity === 'true'    

    try {
        // The validator check if user input is valid against schema
        const validator = jsonschema.validate(query, jobSearchSchema)

        //If validator is not valid -> Generate an error
        if(!validator.valid){
            const error = validator.errors.map(e => e.stack)
            throw new BadRequestError(error)
        }

        const jobs = await Job.findAll(query)
        return res.json({ jobs })
    } catch (error) {
        return next(error)
    }
})

/**
 * GET /[jobId] => { job }
 * 
 * Job is { id, title, salary, equity, company }
 *  where company is { handle, name, description, numEmployees, logoUrl }
 * 
 * Authorization Required : None
*/

router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id)
        return res.json({ job })
    } catch (error) {
        return next(error)
    }
})


/**
 * PATCH /[jobId] { fld1, fld2, ... } => { job }
 * 
 * Data can include { title, salary, equity }
 * 
 * Return { id, title, salary, equity, companyHandle }
 * 
 * Authorization Required: admin 
*/

router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema)
        if(!validator.valid){
            const err = validator.errors.map(e => e.stack)
            throw new BadRequestError(err)
        }

        const job = await Job.update(req.params.id, req.body)
        return res.json({ job })
    } catch (error) {
        return next(error)
    }
})

/**
 * DELETE /[handle] => { deleted: id }
 * 
 * Authorization Required: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next ){
    try {
        await Job.delete(req.params.id)
        return res.json({ deleted: +req.params.id})
    } catch (error) {
        return next(error)
    }
})

module.exports = router