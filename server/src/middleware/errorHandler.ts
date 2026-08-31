import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled Server Error:', err);

  // MySQL Duplicate entry error (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    const message = err.sqlMessage || 'A record with these unique details already exists.';
    if (message.includes('roll_number')) {
      res.status(409).json({
        success: false,
        message: 'A student with this Roll Number is already registered.',
      });
      return;
    }
    if (message.includes('email')) {
      res.status(409).json({
        success: false,
        message: 'An account with this Email address is already registered.',
      });
      return;
    }
    if (message.includes('uq_event_student')) {
      res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this event.',
      });
      return;
    }
    if (message.includes('uq_bookmark')) {
      res.status(409).json({
        success: false,
        message: 'This event is already bookmarked.',
      });
      return;
    }

    res.status(409).json({
      success: false,
      message: 'Duplicate entry detected.',
    });
    return;
  }

  // Foreign Key constraint failures
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    res.status(400).json({
      success: false,
      message: 'Invalid reference or related records exist.',
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
