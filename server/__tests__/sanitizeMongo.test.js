const sanitizeMongo = require("../middleware/sanitizeMongo");

function makeMockReq(body = {}, query = {}, params = {}) {
  return { body, query, params };
}

describe("sanitizeMongo middleware", () => {
  const next = jest.fn();

  beforeEach(() => next.mockClear());

  it("calls next()", () => {
    sanitizeMongo(makeMockReq(), {}, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("strips keys starting with $", () => {
    const req = makeMockReq({ $gt: 1, safe: "ok" });
    sanitizeMongo(req, {}, next);
    expect(req.body).toEqual({ safe: "ok" });
  });

  it("strips keys containing embedded $", () => {
    const req = makeMockReq({ "a.$gt": 1, clean: true });
    sanitizeMongo(req, {}, next);
    expect(req.body).toEqual({ clean: true });
  });

  it("replaces string values starting with $ with empty string", () => {
    const req = makeMockReq({ role: "$admin" });
    sanitizeMongo(req, {}, next);
    expect(req.body.role).toBe("");
  });

  it("sanitizes nested objects", () => {
    const req = makeMockReq({ nested: { $gt: 1, ok: "yes" } });
    sanitizeMongo(req, {}, next);
    expect(req.body.nested).toEqual({ ok: "yes" });
  });

  it("sanitizes arrays", () => {
    const req = makeMockReq({ items: ["$evil", "good"] });
    sanitizeMongo(req, {}, next);
    expect(req.body.items).toEqual(["", "good"]);
  });

  it("sanitizes query parameters", () => {
    const req = makeMockReq({}, { $where: "1" });
    sanitizeMongo(req, {}, next);
    expect(req.query).toEqual({});
  });

  it("sanitizes route params", () => {
    const req = makeMockReq({}, {}, { id: "$oid" });
    sanitizeMongo(req, {}, next);
    expect(req.params.id).toBe("");
  });

  it("leaves clean data untouched", () => {
    const body = { name: "Test", count: 42, nested: { ok: true } };
    const req = makeMockReq(JSON.parse(JSON.stringify(body)));
    sanitizeMongo(req, {}, next);
    expect(req.body).toEqual(body);
  });
});
