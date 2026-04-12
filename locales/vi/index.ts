/**
 * Bản dịch tiếng Việt — gộp từ các file namespace (key dùng với t() / i18n.t()).
 * Ứng dụng chỉ dùng ngôn ngữ này.
 */
import common from './common.json';
import pages from './pages.json';
import employee from './employee.json';
import department from './department.json';
import branch from './branch.json';
import position from './position.json';
import jobLevel from './jobLevel.json';
import permission from './permission.json';
import backup from './backup.json';
import company from './company.json';
import tenure from './tenure.json';
import loginDevices from './loginDevices.json';
import payrollIp from './payroll-ip.json';
import adminForm from './admin-form.json';
import attendance from './attendance.json';
import chucNangNhiemVu from './chucNangNhiemVu.json';
import diemCongTru from './diem-cong-tru.json';
import chamDiemKpi from './cham-diem-kpi.json';
import bangLuong from './bang-luong.json';
import thietLapCongViec from './thiet-lap-cong-viec.json';
import duAn from './du-an.json';
import congViec from './cong-viec.json';
import baoCao from './bao-cao.json';
import guide from './guide.json';
import thietLapTaiLieu from './thiet-lap-tai-lieu.json';
import taiLieu from './tai-lieu.json';
import hoSo from './ho-so.json';
import kho from './kho.json';
import truyenThong from './truyen-thong.json';
import trangTin from './trang-tin.json';

const vi = {
  ...(common as Record<string, string>),
  ...(pages as Record<string, string>),
  ...(employee as Record<string, string>),
  ...(department as Record<string, string>),
  ...(branch as Record<string, string>),
  ...(position as Record<string, string>),
  ...(jobLevel as Record<string, string>),
  ...(permission as Record<string, string>),
  ...(backup as Record<string, string>),
  ...(company as Record<string, string>),
  ...(tenure as Record<string, string>),
  ...(loginDevices as Record<string, string>),
  ...(payrollIp as Record<string, string>),
  ...(adminForm as Record<string, string>),
  ...(attendance as Record<string, string>),
  ...(chucNangNhiemVu as Record<string, string>),
  ...(diemCongTru as Record<string, string>),
  ...(chamDiemKpi as Record<string, string>),
  ...(bangLuong as Record<string, string>),
  ...(thietLapCongViec as Record<string, string>),
  ...(duAn as Record<string, string>),
  ...(congViec as Record<string, string>),
  ...(baoCao as Record<string, string>),
  ...(guide as Record<string, string>),
  ...(thietLapTaiLieu as Record<string, string>),
  ...(taiLieu as Record<string, string>),
  ...(hoSo as Record<string, string>),
  ...(kho as Record<string, string>),
  ...(truyenThong as Record<string, string>),
  ...(trangTin as Record<string, string>),
};

export default vi;
