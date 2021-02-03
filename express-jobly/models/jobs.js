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
     * Filtering:
     * - title: Should be case-insensitive, matches any part of string search.
     * - minSalary: Filter to job with at least that salary.
     * - hasEquity:
     *  - if true, filter to jobs that provide a non zero amount of equity.
     *  - if false, or not include in the filtering -> list all jobs regardless of equity.
     * 
     * return [ { id, title, salary, equity, companyHandle, companyName }, ... ]
    */

    static async findAll(filtering = {}){
        //Statements to select the data from the jobs tables
        let jobsQuery = `SELECT j.id,
                                  j.title,
                                  j.salary,
                                  j.equity,
                                  j.company_handle AS "companyHandle",
                                  c.name AS "companyName"
                           FROM jobs j
                            LEFT JOIN companies AS c ON c.handle = j.company_handle`;

        let expression = []
        let query = []
        
        //Optional filtering criteria that can be passed in the query string 
        const { title, minSalary, hasEquity  } = filtering

        // If title is passed, it will push to the statement and query variables
        if(title !== undefined){
            query.push(`%${title}%`)
            expression.push(`title ILIKE $${query.length}`)
        }

        // If minEmployees is passed - it will push to the statements and query variables
        if(minSalary !== undefined){
            query.push(minSalary)
            expression.push(`salary >= $${query.length}`)
        }

        // if has equity -> push tot he statement and query variables
        // if has not equity -> Return all list jobs of equity
        if(hasEquity === true){
            expression.push(`equity > 0`)
        } 

        // Add any new expression to the original statement to generate the correct filter
        if(expression.length > 0){
            jobsQuery += " WHERE " + expression.join(" AND ")
        }

        // Complete the query and return the result
        jobsQuery += " ORDER BY title"
        const result  = await db.query(jobsQuery, query)
        return result.rows
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