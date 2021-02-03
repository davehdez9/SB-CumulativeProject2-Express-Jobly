"user strict"

const request = require("supertest")

const app = require("../app")

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken,
    jobIdTest
} = require("./_testCommon")

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/************ POST   /jobs */
describe("POST /jobs", function(){
    const newJob = {
        title: "new",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1"
    }

    test("ok for admin", async function(){
        const response = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${adminToken}`)
        expect(response.statusCode).toEqual(201)
    })
    
    test('bad request with missing data ', async () => {
        const response = await request(app)
            .post("/jobs")
            .send({
                title: "new"
            })
            .set("authorization", `Bearer ${adminToken}`)
        expect(response.statusCode).toEqual(400)
    })

    test("Bad request with invalid data", async () => {
        const response = await request(app)
            .post("/jobs")
            .send({
                title: "new",
                salary: "100",
                equity: "0.1",
                companyHandle: "c1"
            })
            .set("authorization", `Bearer ${adminToken}`)
        expect(response.statusCode).toEqual(400)
    })
    
})

/************ GET    /companies */

describe("GET /companies",function () {
    test("Find all jobs", async function () {
        const response = await request(app).get("/jobs")
        expect(response.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1"
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1"
                },
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1"
                },
            ]
        })
    })
    
})

/************ POST   /companies/:id */

describe("GET /jobs/:id", function() {
    test("Get jobs with its id", async function(){
        const response = await request(app)
            .get(`/jobs/${jobIdTest[0]}`)
        expect(response.body).toEqual({
            job: {
                id: jobIdTest[0],
                title: "J1",
                salary: 1,
                equity: "0.1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img"
                }
            }
        })
    })

    test('not found compnay', async () => {
        const response = await request(app).get(`/jobs/0`)
        expect(response.statusCode).toEqual(404)
    })
    
})

/************ PATCH  /companies/:id */

describe('PATCH /jobs/:id', function () {
    test("work for user/admin", async function(){
        const response = await request(app)
            .patch(`/jobs/${jobIdTest[0]}`)
            .send({
                title: "J1-new"
            })
            .set("authorization", `Bearer ${adminToken}`)
        expect(response.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "J1-new",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1"
            }
        })
    })

    test("unauth", async function () {
        const response = await request(app)
            .patch(`/jobs/${jobIdTest[0]}`)
            .send({
                title: "J1-new"
            })
        expect(response.statusCode).toEqual(401)
    })

    test("Not found company", async function () {
        const response = await request(app)
            .patch(`/jobs/0`)
            .send({
                title: "new nope"
            })
            .set("authorization", `Bearer ${adminToken}`)
        expect(response.statusCode).toEqual(404)
    })

    test("bad request with invalid data", async function(){
        const response = await request(app)
            .patch(`/jobs/${jobIdTest[0]}`)
            .send({
                salary: "new"
            })
            .set("authorization", `Bearer ${adminToken}`)
        expect(response.statusCode).toEqual(400)
    })
})

/************ DELETE /companies/:id */

describe("DELETE /jobs/:id", function () {
    test("Work for users", async function(){
        const response = await request(app)
            .delete(`/jobs/${jobIdTest[0]}`)
            .set("authorization", `Bearer ${adminToken}`)
        expect(response.body).toEqual({ deleted: jobIdTest[0] })
    })

    test("unauth", async function(){
        const response = await request(app)
            .delete(`/jobs/${jobIdTest[0]}`)
        expect(response.statusCode).toEqual(401)
    })

    test("Not found job", async function(){
        const response = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`)
        expect(response.statusCode).toEqual(404)
    })
})