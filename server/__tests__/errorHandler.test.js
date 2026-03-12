const multer = require("multer");
const errorHandler = require("../middleware/errorHandler");

describe("errorHandler", () => {
  it("maps multer file-size errors to a 400 response", () => {
    const error = new multer.MulterError("LIMIT_FILE_SIZE");
    const response = {
      headersSent: false,
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    errorHandler(error, {}, response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Datoteka može imati najviše 5 MB.",
    });
  });
});
