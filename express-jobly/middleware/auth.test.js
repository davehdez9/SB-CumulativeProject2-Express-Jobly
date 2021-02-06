"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrUser
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");


describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureAdmin", function(){
  test("middleware works", function(){
    expect.assertions(1)
    const req = {}
    const res = { locals: { user: { username: "test", isAdmin: true } } }
    const next = function(err) {
      expect(err).toBeFalsy()
    }
    ensureAdmin(req, res, next)
  })

  test("Unauthorized admim", function(){
    expect.assertions(1)
    const req = {}
    const res = { locals: { user: { username: "test", isAdmin: false } } }
    const next = function(err) {
      expect(err).toBeTruthy()
    }
    ensureAdmin(req, res, next)
  })
})

describe("ensureAdminOrUser", function(){
  test("Midd works", function(){
    expect.assertions(1)
    const req = {  params: { username: "test" } }
    const res = { locals: { user: { username: "admin", isAdmin: true } } }
    const next = function(err){
      expect(err).toBeFalsy()
    } 
    ensureAdminOrUser(req, res, next)
  })

  test("unauth", function(){
    expect.assertions(1)
    const req = { params: { username: "Mistake" } }
    const res = { locals: { user: { username: "test", isAdmin: false } } }
    const next = function(err){
      expect(err instanceof UnauthorizedError).toBeTruthy()
    }
    ensureAdminOrUser(req, res, next)
  })
})