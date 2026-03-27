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

  it("rejects string values starting with $ with a 400 error", () => {
    const req = makeMockReq({ role: "$admin" });
    sanitizeMongo(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("sanitizes nested objects", () => {
    const req = makeMockReq({ nested: { $gt: 1, ok: "yes" } });
    sanitizeMongo(req, {}, next);
    expect(req.body.nested).toEqual({ ok: "yes" });
  });

  it("rejects arrays containing values starting with $", () => {
    const req = makeMockReq({ items: ["$evil", "good"] });
    sanitizeMongo(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("sanitizes query parameters", () => {
    const req = makeMockReq({}, { $where: "1" });
    sanitizeMongo(req, {}, next);
    expect(req.query).toEqual({});
  });

  it("rejects route params with values starting with $", () => {
    const req = makeMockReq({}, {}, { id: "$oid" });
    sanitizeMongo(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("leaves clean data untouched", () => {
    const body = { name: "Test", count: 42, nested: { ok: true } };
    const req = makeMockReq(JSON.parse(JSON.stringify(body)));
    sanitizeMongo(req, {}, next);
    expect(req.body).toEqual(body);
  });
});
