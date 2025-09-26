import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { authenticate, authorize } from '../../middleware/auth';
import { AuthenticatedRequest, IUser } from '../../types';

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
  },
}));

jest.mock('../../models/User', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

const mockedJwt = jwt as unknown as { verify: jest.Mock };
const mockedUserModel = User as unknown as { findById: jest.Mock };

const createMockUser = (overrides: Partial<IUser> = {}): IUser =>
  ({
    _id: '507f1f77bcf86cd799439011' as unknown as IUser['_id'],
    id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'admin',
    isActive: true,
    comparePassword: jest.fn(),
    ...overrides,
  }) as unknown as IUser;

const mockFindByIdSelect = (user: IUser | null) => {
  const select = jest.fn().mockResolvedValue(user);
  mockedUserModel.findById.mockReturnValue({ select });
  return select;
};

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('authenticate middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it('returns 401 when no token is provided', async () => {
    const req = {
      cookies: {},
      header: jest.fn().mockReturnValue(undefined),
    } as unknown as AuthenticatedRequest;

    const res = createMockResponse();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied. No token provided.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token verification fails', async () => {
    const req = {
      cookies: { 'auth-token': 'invalid' },
      header: jest.fn(),
    } as unknown as AuthenticatedRequest;

    const res = createMockResponse();

    mockedJwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authenticate(req, res, next);

    expect(mockedJwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when user is not found or inactive', async () => {
    const req = {
      cookies: { 'auth-token': 'valid-token' },
      header: jest.fn(),
    } as unknown as AuthenticatedRequest;

    const res = createMockResponse();

    mockedJwt.verify.mockReturnValue({ id: 'user123' });
    mockFindByIdSelect(createMockUser({ isActive: false }));

    await authenticate(req, res, next);

    expect(mockedUserModel.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token or user account disabled.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user to request and calls next on success', async () => {
    const req = {
      cookies: { 'auth-token': 'valid-token' },
      header: jest.fn(),
    } as unknown as AuthenticatedRequest;

    const res = createMockResponse();

    const user = createMockUser({ id: 'user123', role: 'admin', isActive: true });

    mockedJwt.verify.mockReturnValue({ id: 'user123' });
    mockFindByIdSelect(user);

    await authenticate(req, res, next);

    expect(mockedUserModel.findById).toHaveBeenCalledWith('user123');
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('authorize middleware', () => {
  const runAuthorize = (roles: string[], req: Partial<AuthenticatedRequest>) => {
    const res = createMockResponse();
    const next = jest.fn();
    authorize(...roles)(req as AuthenticatedRequest, res, next);
    return { res, next };
  };

  it('returns 401 when user is not authenticated', () => {
    const { res, next } = runAuthorize(['admin'], {});

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication required.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user does not have required role', () => {
    const { res, next } = runAuthorize(['admin'], {
      user: createMockUser({ role: 'customer' }),
    });

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied. Insufficient permissions.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user has required role', () => {
    const res = createMockResponse();
    const next = jest.fn();

    authorize('admin')(
      {
        user: createMockUser({ role: 'admin' }),
      } as AuthenticatedRequest,
      res,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
