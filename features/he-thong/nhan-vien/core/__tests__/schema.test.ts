import { describe, it, expect } from 'vitest';
import { employeeSchema } from '../schema';

const validData = () => ({
  ho_ten: 'Nguyễn Văn A',
  so_dien_thoai: '0901234567',
  chuc_vu_id: '1',
  anh_dai_dien: '',
});

const parse = (overrides: Record<string, unknown> = {}) =>
  employeeSchema.safeParse({ ...validData(), ...overrides });

describe('employeeSchema', () => {
  it('chấp nhận dữ liệu hợp lệ', () => {
    expect(parse().success).toBe(true);
  });

  it('từ chối họ tên quá ngắn', () => {
    expect(parse({ ho_ten: 'A' }).success).toBe(false);
  });

  it('từ chối SĐT không hợp lệ', () => {
    expect(parse({ so_dien_thoai: '123' }).success).toBe(false);
  });

  it('từ chối thiếu chức vụ', () => {
    expect(parse({ chuc_vu_id: '' }).success).toBe(false);
  });
});
