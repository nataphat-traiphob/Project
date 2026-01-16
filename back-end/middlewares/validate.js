export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: result.error.flatten().fieldErrors,
    });
  }

  req.validated = result.data;
  next();
};
