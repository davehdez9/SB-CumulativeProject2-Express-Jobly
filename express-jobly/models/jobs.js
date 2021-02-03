"use strict"

const db = require("../db")
const { BadRequestError, NotFoundError } = require("../expressError")
const { sqlForPartialUpdate } = require("../helpers/sql")

/** Relate Functions for Jobs */

class Job {

    /**
     * Crate a Job  - return new job data
     * 
     * data { title, salary, equity, companyHandle }
     * 
     * return { id, title, salary, equity, companyHandle }
     */

    static async create(data){
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
             [
                data.title, 
                data.salary, 
                data.equity,
                data.companyHandle,
             ])
        let job = result.rows[0]
        return job
    }

    /**
     * Find all jobs
     * 
     * return [ { id, title, salary, equity, companyHandle, companyName }, ... ]
     */

    static async findAll(){   
        const jobsResults = await db.query(
            `SELECT j.id,
                    j.title,
                    j.salary,
                    j.equity,
                    j.company_handle AS "companyHandle",
                    c.name AS "companyName"
             FROM jobs j
             LEFT JOIN companies AS c ON c.handle = j.company_handle
             ORDER BY title`)
        return jobsResults.rows
    }

    /**
     * Find a Job with its id and return its data
     * 
     * Return { id, title, salary, equity, companyHandle, company},
     *  company : { handle, name, description, numEmployees, logoUrl}
     * 
     * Throw NotFoundError if not found
     */

    static async get(id){
        const jobResponse = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`, [id])
        
        const job = jobResponse.rows[0]

        if (!job) throw new NotFoundError(`Not job found: ${id}`)

        const companiesResponse = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             WHERE handle = $1`, [job.companyHandle])

        delete job.companyHandle
        job.company = companiesResponse.rows[0]

        return job
    }

    /**
     * Update job with data and the Id
     * 
     * This is a partial update -- it is fine if data does not contain all the fields; change provide ones
     * 
     * Data can include: { title, salary, equity }
     * 
     * Returns { id, title, salary, equity, companyHandle }
     * 
     * Throw NotFoundError if not found
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {})
        const idVarIdx = "$" + (values.length + 1)

        const query = `UPDATE jobs
                       SET ${setCols}
                       WHERE id = ${idVarIdx}
                       RETURNING id,
                                 title,
                                 salary,
                                 equity,
                                 company_handle AS "companyHandle"`
        
        const results = await db.query(query, [...values, id])
        const job = results.rows[0]

        if(!job) throw new NotFoundError(`No job: ${id}`)

        return job
        
    }

    /**
     * Delete a job - return undefined 
     * 
     * throw Error if job is not found
     */

    static async delete(id) {
        const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`, [id])
        const job = result.rows[0]

        if(!job) throw new NotFoundError(`No job with this id: ${id}`)
        
    }
}

module.exports = Job