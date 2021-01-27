const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**
 * It will help to SET the data for an UPDATE statement
 * 
 * @param {Array} dataToUpdate {firstName: 'Aliya', age: 32}
 * @param {Object} jsToSql { firstName: "first_name",lastName: "last_name", ..} -> provide fields from the database
 * @returns {Object} {setCols, values} 
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  debugger
  // Return an array of the keys from the dataToUpdate Object 
  const keys = Object.keys(dataToUpdate);
  // Throw an error if the dataToUpdate is empty
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  // Create an array of keys and populate it with the jsToSql key from the database with the respective idx
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // setCols -> is the concatenation of the elements that will help to SET the data in the UPDATE statement
  //values -> Contain the values from the dataToUpdate
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
