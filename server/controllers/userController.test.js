import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getUsersByRole } from '../controllers/userController.js';
import User from '../models/User.js';

// Mock the User model
vi.mock('../models/User.js', () => ({
  default: {
    find: vi.fn()
  }
}));

// Mock the minio client
vi.mock('minio', () => ({
  Client: vi.fn(() => ({
    statObject: vi.fn().mockRejectedValue(new Error('Not found'))
  }))
}));

describe('userController - getUsersByRole', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Mock request and response objects
    req = {
      query: {}
    };
    
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };

    // Mock console.log to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 if role query param is missing', async () => {
    req.query = {};

    await getUsersByRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Role query param is required' });
  });

  it('should fetch users by role only when department is not provided', async () => {
    req.query = { role: 'Faculty' };

    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'Faculty', department: 'SCEE' },
      { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Faculty', department: 'SMME' }
    ];

    User.find.mockReturnValue({
      select: vi.fn().mockResolvedValue(mockUsers)
    });

    await getUsersByRole(req, res);

    expect(User.find).toHaveBeenCalledWith({ role: 'Faculty' });
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'John Doe' }),
        expect.objectContaining({ name: 'Jane Smith' })
      ])
    );
  });

  it('should fetch users by role and department when department is provided', async () => {
    req.query = { role: 'Faculty', department: 'SCEE' };

    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'Faculty', department: 'SCEE' }
    ];

    User.find.mockReturnValue({
      select: vi.fn().mockResolvedValue(mockUsers)
    });

    await getUsersByRole(req, res);

    expect(User.find).toHaveBeenCalledWith({ role: 'Faculty', department: 'SCEE' });
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'John Doe', department: 'SCEE' })
      ])
    );
  });

  it('should return empty array when no users match the query', async () => {
    req.query = { role: 'Faculty', department: 'NONEXISTENT' };

    User.find.mockReturnValue({
      select: vi.fn().mockResolvedValue([])
    });

    await getUsersByRole(req, res);

    expect(User.find).toHaveBeenCalledWith({ role: 'Faculty', department: 'NONEXISTENT' });
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('should handle database errors gracefully', async () => {
    req.query = { role: 'Faculty' };

    const dbError = new Error('Database connection failed');
    User.find.mockReturnValue({
      select: vi.fn().mockRejectedValue(dbError)
    });

    await getUsersByRole(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
  });

  it('should exclude password field from results', async () => {
    req.query = { role: 'Faculty', department: 'SCEE' };

    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'Faculty', department: 'SCEE' }
    ];

    const selectMock = vi.fn().mockResolvedValue(mockUsers);
    User.find.mockReturnValue({
      select: selectMock
    });

    await getUsersByRole(req, res);

    expect(selectMock).toHaveBeenCalledWith('-password');
  });

  it('should filter Faculty by multiple different departments correctly', async () => {
    // First call with SCEE
    req.query = { role: 'Faculty', department: 'SCEE' };
    const sceeUsers = [
      { _id: '1', name: 'SCEE Prof', role: 'Faculty', department: 'SCEE' }
    ];
    User.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue(sceeUsers)
    });

    await getUsersByRole(req, res);
    expect(User.find).toHaveBeenCalledWith({ role: 'Faculty', department: 'SCEE' });

    // Second call with SMME
    req.query = { role: 'Faculty', department: 'SMME' };
    const smmeUsers = [
      { _id: '2', name: 'SMME Prof', role: 'Faculty', department: 'SMME' }
    ];
    User.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue(smmeUsers)
    });

    await getUsersByRole(req, res);
    expect(User.find).toHaveBeenCalledWith({ role: 'Faculty', department: 'SMME' });
  });
});
