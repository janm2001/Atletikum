const makeLeanQuery = (value) => ({
  lean: jest.fn().mockResolvedValue(value),
});

const makeSortLeanQuery = (value) => ({
  sort: jest.fn().mockReturnValue(makeLeanQuery(value)),
});

const makeSelectLeanQuery = (value) => ({
  select: jest.fn().mockReturnValue(makeLeanQuery(value)),
});

const makeSelectSortLeanQuery = (value) => ({
  select: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(value),
    }),
  }),
});

const makeSelectSortLimitLeanQuery = (value) => ({
  select: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue(makeLeanQuery(value)),
      lean: jest.fn().mockResolvedValue(value),
    }),
  }),
});

module.exports = {
  makeLeanQuery,
  makeSortLeanQuery,
  makeSelectLeanQuery,
  makeSelectSortLeanQuery,
  makeSelectSortLimitLeanQuery,
};
