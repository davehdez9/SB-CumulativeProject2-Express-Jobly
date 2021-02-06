"use strict"

const db =  require("../db")
const { BadRequestError, NotFoundError } = require("../expressError")
const Job = require("./jobs")
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    idJobs
} = require("./_testCommon")

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/******* Create */
describe("Create/add new job", function(){
    let newJob = {
        companyHandle: "c1",
        title: "Test",
        salary: 100,
        equity: "0.1",
    };

    test('should add a new job', async () => {
        let job = await Job.create(newJob)
        expect(job).toEqual({
            ...newJob,
            id: expect.any(Number)
        }) 
    })
})

/******* Find All */

describe("find all jobs", function(){
    test("find all jobs: no filter", async function(){
        let jobs = await Job.findAll()
        expect(jobs).toEqual([
            {
                id: idJobs[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: 'c1',
                companyName: "C1"
            },
            {
                id: idJobs[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: 'c1',
                companyName: "C1"
            },
            {
                id: idJobs[2],
                title: "Job3",
                salary: 300,
                equity: "0",
                companyHandle: 'c1',
                companyName: "C1"
            },
            {
                id: idJobs[3],
                title: "Job4",
                salary: null,
                equity: null,
                companyHandle: 'c1',
                companyName: "C1"
            },
        ])
    })

    test('should filter by title ', async () => {
        let job = await Job.findAll({ title: "ob1" })
        expect(job).toEqual([
            {
                id: idJobs[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: 'c1',
                companyName: "C1"
            }
        ])
    })

    test('should filter by minSalary', async () => {
        let job = await Job.findAll({ minSalary: 250 })
        expect(job).toEqual([
            {
                id: idJobs[2],
                title: "Job3",
                salary: 300,
                equity: "0",
                companyHandle: 'c1',
                companyName: "C1"
            }
        ])
    })
    
    test('should filter by equity', async () => {
        let jobs = await Job.findAll({ hasEquity: true })
        expect(jobs).toEqual([
            {
                id: idJobs[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: 'c1',
                companyName: "C1"
            },
            {
                id: idJobs[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: 'c1',
                companyName: "C1"
            }
        ])
    })
    
    test('should works with minSalary and equity', async () => {
        let jobs = await Job.findAll({ minSalary: 150, hasEquity: true })
        expect(jobs).toEqual([
            {
                id: idJobs[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }
        ])
    })
    
})

/******* Get */

describe("get", function(){
    test("Get a job list", async function(){
        let job = await Job.get(idJobs[0])
        expect(job).toEqual({
            id: idJobs[0],
            title: "Job1",
            salary: 100,
            equity: "0.1",
            company: {
                handle: 'c1',
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img"
            }
        })
    })

    test("not found that job id", async function(){
        try {
            await Job.get(0)
            fail()
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy()
        }
    })
})

/******* Update */

describe("update", function(){
    let updateData = {
        title: "NewData",
        salary: 600,
        equity: "0.2"
    }
    
    test("work", async function(){
        let job = await Job.update(idJobs[0], updateData)
        expect(job).toEqual({
            id: idJobs[0],
            companyHandle: "c1",
            ...updateData,
        })
    })

    test("Not found that job", async function(){
        try {
            await Job.update(0, {
                title: "test"
            })
            fail()
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy()
        }
    })
    
})

/******* Remove */

describe("delete", function(){
    test("delete job", async function(){
        await Job.delete(idJobs[0])
        const res = await db.query(
            "SELECT id FROM jobs WHERE id = $1", [idJobs[0]])
        expect(res.rows.length).toEqual(0)
    })

    test("not found that job id", async function(){
        try {
            await Job.delete(0)
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy()
        }
    })
})