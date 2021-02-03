"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies and filtering optional criteria
   *
   * filtering:
   * - name: case-insensitive
   * - minEmployees: have at least that number of employees
   * - maxEmployees: have no more than that number of employees
   * 
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filtering = {}) {
    // Statement to select the data from companies tables
    let companiesRes = `SELECT handle,
                               name,
                               description,
                               num_employees AS "numEmployees",
                              logo_url AS "logoUrl"
                        FROM companies`;

    let expression = [];
    let query = [];

    // Optional filtering criteria that can be passed in the query string
    const { name, minEmployees, maxEmployees} = filtering;

    // If name is passed, it will push to the statement and query variables to be add to the original statement
    if(name){
      query.push(`%${name}%`)
      expression.push(`name ILIKE $${query.length}`)
    }

    //If minEmployees is greater than maxEmployees - Respond 404 with the appropriate message.
    if( minEmployees > maxEmployees ){
      throw new BadRequestError("minEmployees cannot be greater that maxEmployees")
    }

    // If minEmployees is passed, it will push to the statement and query variables to be add to the original statement
    if( minEmployees !== undefined ){
      query.push(minEmployees)
      expression.push(`num_employees >= $${query.length}`)
    }

    // If maxEmployees is passed, it will push to the statement and query variables to be add to the original statement
    if( maxEmployees !== undefined ){
      query.push(maxEmployees)
      expression.push(`num_employees <= $${query.length}`)
    }

    // If there any new expression - it will add to the original statement to generate the filtering 
    if( expression.length > 0 ){
      companiesRes += " WHERE " + expression.join(" AND ")
    }

    companiesRes += " ORDER BY name"
    const result = await db.query(companiesRes, query)
    return result.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    const jobResponse = await db.query(
      `SELECT id,
              title,
              salary,
              equity
       FROM jobs
       WHERE company_handle =$1`, [handle]
    )
    
    company.jobs = jobResponse.rows
    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}
module.exports = Company;
