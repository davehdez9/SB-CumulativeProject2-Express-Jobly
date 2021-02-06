const { sqlForPartialUpdate } = require("./sql")

describe("sqlForPartialUpdate Function", function(){
    test("work with 1 item", function(){
        const input = sqlForPartialUpdate(
            { firstName: 'Aliya'},
            { firstName: "first_name", lastName: "last_name"}
        )
        expect(input).toEqual({
            setCols: "\"first_name\"=$1",
            values: ["Aliya"]
        })
    })
})