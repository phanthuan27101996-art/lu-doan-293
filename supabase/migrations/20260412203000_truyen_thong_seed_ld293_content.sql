-- Nạp / cập nhật nội dung mặc định "Truyền thống" Lữ đoàn 293 (văn bản thuần).
-- Chạy: supabase db push hoặc SQL Editor.
-- Bảng public.truyen_thong đã tồn tại; trigger tg_cap_nhat áp dụng khi UPDATE.

BEGIN;

UPDATE public.truyen_thong AS t
SET thong_tin = v.txt
FROM (
  SELECT $TR293SEED$
MỘT SỐ NÉT CHÍNH VỀ TRUYỀN THỐNG VÀ THÀNH TÍCH CỦA LỮ ĐOÀN 293
- Chức năng, nhiệm vụ:
      Là đơn vị Công binh dự bị chiến lược của Bộ, thực hiện nhiệm vụ huấn luyện, sẵn sàng chiến đấu; xây dựng, quản lý, bảo vệ, bảo quản công trình quốc phòng; phòng chống thiên tai, tìm kiếm cứu nạn; rà phá bom mìn, vật nổ còn sót lại sau chiến tranh và sẵn sàng thực hiện các nhiệm vụ khác.

- Những mốc thời gian chính: 
      + Ngày 18/10/1992, Bộ tư lệnh Công binh ban hành quyết định  số 1285/QĐ-TL giao nhiệm vụ cho các đơn vị gồm Lữ đoàn 279 thành lập tiểu đoàn công binh 37, Lữ đoàn 229 thành lập tiểu đoàn công binh 32. Ngay sau khi thành lập, tiểu đoàn 32 và tiểu đoàn 37 đã tổ chức tập huấn nghiệp vụ chuyên ngành để chuẩn bị cho việc thành lập Trung đoàn công binh 293 (tiền thân của Lữ đoàn 293 hiện nay).
      + Ngày 08/4/1993, Bộ Quốc phòng ra Quyết định số 143/QĐ-QP thành lập Trung đoàn 293 trực thuộc Binh chủng công binh (Trung đoàn còn có tên gọi khác là Đoàn Công binh Thăng Long), tổ chức ban đầu của Trung đoàn gồm Trung đoàn bộ và các Tiểu đoàn đủ quân, quân số được biên chế theo đúng quy định của Bộ. Chức năng nhiệm vụ của Trung đoàn là đơn vị Công binh công trình dự bị chiến lược của Bộ, có nhiệm vụ xây dựng công trình phòng thủ bảo vệ Tổ quốc khu vực Nam Trung Bộ (bao gồm đất liền, bán đảo, đảo gần, đảo xa). Lực lượng Trung đoàn ngay từ ngày đầu thành lập gồm cán bộ, chiến sĩ của các đơn vị, nhà trường và các cơ quan trong Binh chủng hợp lại, song nòng cốt vẫn là của 2 đơn vị, Lữ đoàn 229 và 279. 
      + Từ ngày 31/5 - 31/6/1993 Trung đoàn 293 đã tổ chức 4 đợt hành quân bằng đường sắt và đường bộ vào huyện Cam Ranh (nay là thành phố Cam Ranh, tỉnh Khánh Hòa), bảo đảm an toàn tuyệt đối về mọi mặt. Ngay từ ngày đầu thành lập, Đảng ủy, chỉ huy Trung đoàn đã quán triệt sâu sắc nghị quyết, chỉ thị, mệnh lệnh của cấp trên, nắm vững chức năng nhiệm vụ của đơn vị. Trung đoàn đã nhanh chóng ổn định về mọi mặt, tổ chức huấn luyện bổ sung và làm công tác chuẩn bị cho thực hiện nhiệm vụ. Tập trung xây dựng đơn vị ổn định về chính trị, tư tưởng và tổ chức, làm cho cán bộ, chiến sỹ nhận thức rõ vị trí chức năng nhiệm vụ của Trung đoàn. Nội bộ đơn vị đoàn kết một lòng, luôn chủ động khắc phục khó khăn gian khổ, hoàn thành thắng lợi mọi nhiệm vụ được giao. Chỉ trong một thời gian ngắn, Trung đoàn đã ổn định tổ chức biên chế và hành quân vào vị trí thực hiện nhiệm vụ an toàn, sẵn sàng thực hiện nhiệm vụ được ngay. 
      + Ngày 01/8/1993, Trung đoàn tổ chức ra quân thực hiện nhiệm vụ XDCT đầu tiên.
      + Từ tháng 08/1993 đến tháng 03/2008, Trung đoàn đã tổ chức thi công hoàn thành nhiều công trình chiến đấu và đường cơ động ở khu vực duyên hải Nam Trung bộ, đường tuần tra biên giới; trong giai đoạn này, ngày 08 tháng 4 năm 2001, Tiểu đoàn 27 thuộc Trung đoàn được tặng thưởng danh hiệu Anh hùng lực lượng vũ trang nhân dân; ngày 08 tháng 4 năm 2008, Trung đoàn được tặng thưởng Huân chương Bảo vệ Tổ quốc hạng ba. 
      + Đầu năm 2009, Trung đoàn được giao nhiệm vụ xây dựng, quản lý, bảo quản, bảo vệ cụm công trình CT229 và huấn luyện chiến sĩ mới.
      + Ngày 15/8/2011, Bộ Quốc phòng ra Quyết định số 2890/QĐ-BQP về việc nâng cấp Trung đoàn Công binh Công trình 293 lên Lữ đoàn Công binh Công trình 293.
      + Năm 2013, được Chủ tịch nước tặng thưởng danh hiệu Anh hùng lực lượng vũ trang nhân dân. 
      + Năm 2014, với thành tích xuất sắc giải cứu thành công 12 công nhân bị mắc kẹt trong sự cố sập hầm Nhà máy thủy điện Đạ Dâng, Lâm Đồng, Lữ đoàn được tặng thưởng Huân chương Chiến công Hạng nhất.
      + Năm 2017, được Chủ tịch nước tặng thưởng Huân chương Bảo vệ Tổ quốc hạng Ba.
      + 08/4/2023 Lữ đoàn tổ chức Lễ kỷ niệm 30 năm ngày thành lập  và đón nhận huân chương Bảo vệ Tổ quốc hạng Nhì.

- Thành tích đạt được:
      Trải qua hơn 32 năm xây dựng, phấn đấu và trưởng thành, cán bộ, chiến sĩ Lữ đoàn 293 luôn nêu cao tinh thần dũng cảm, mưu trí, sáng tạo, dám nghĩ, dám làm, vượt qua mọi khó khăn gian khổ, không ngừng phấn đấu vươn lên hoàn thành mọi nhiệm vụ, đã được Đảng, Nhà nước khen tặng nhiều phần thưởng cao quý như: Danh hiệu Anh hùng Lực lượng vũ trang nhân dân; 03 Huân chương Chiến công hạng Nhất; Huân chương Chiến công hạng Nhì; 02 Huân chương Chiến công hạng Ba; Huân chương Bảo vệ Tổ quốc hạng Nhì; 04 Huân chương Bảo vệ Tổ quốc hạng Ba... cùng hàng trăm lượt tập thể, cá nhân được Chính phủ, Bộ Quốc phòng, Bộ Tư lệnh Binh chủng Công Binh, cấp ủy, chính quyền địa phương khen thưởng.
$TR293SEED$::text AS txt
) AS v
WHERE t.id = (SELECT id FROM public.truyen_thong ORDER BY id ASC LIMIT 1);

INSERT INTO public.truyen_thong (thong_tin)
SELECT v.txt
FROM (
  SELECT $TR293SEED$
MỘT SỐ NÉT CHÍNH VỀ TRUYỀN THỐNG VÀ THÀNH TÍCH CỦA LỮ ĐOÀN 293
- Chức năng, nhiệm vụ:
      Là đơn vị Công binh dự bị chiến lược của Bộ, thực hiện nhiệm vụ huấn luyện, sẵn sàng chiến đấu; xây dựng, quản lý, bảo vệ, bảo quản công trình quốc phòng; phòng chống thiên tai, tìm kiếm cứu nạn; rà phá bom mìn, vật nổ còn sót lại sau chiến tranh và sẵn sàng thực hiện các nhiệm vụ khác.

- Những mốc thời gian chính: 
      + Ngày 18/10/1992, Bộ tư lệnh Công binh ban hành quyết định  số 1285/QĐ-TL giao nhiệm vụ cho các đơn vị gồm Lữ đoàn 279 thành lập tiểu đoàn công binh 37, Lữ đoàn 229 thành lập tiểu đoàn công binh 32. Ngay sau khi thành lập, tiểu đoàn 32 và tiểu đoàn 37 đã tổ chức tập huấn nghiệp vụ chuyên ngành để chuẩn bị cho việc thành lập Trung đoàn công binh 293 (tiền thân của Lữ đoàn 293 hiện nay).
      + Ngày 08/4/1993, Bộ Quốc phòng ra Quyết định số 143/QĐ-QP thành lập Trung đoàn 293 trực thuộc Binh chủng công binh (Trung đoàn còn có tên gọi khác là Đoàn Công binh Thăng Long), tổ chức ban đầu của Trung đoàn gồm Trung đoàn bộ và các Tiểu đoàn đủ quân, quân số được biên chế theo đúng quy định của Bộ. Chức năng nhiệm vụ của Trung đoàn là đơn vị Công binh công trình dự bị chiến lược của Bộ, có nhiệm vụ xây dựng công trình phòng thủ bảo vệ Tổ quốc khu vực Nam Trung Bộ (bao gồm đất liền, bán đảo, đảo gần, đảo xa). Lực lượng Trung đoàn ngay từ ngày đầu thành lập gồm cán bộ, chiến sĩ của các đơn vị, nhà trường và các cơ quan trong Binh chủng hợp lại, song nòng cốt vẫn là của 2 đơn vị, Lữ đoàn 229 và 279. 
      + Từ ngày 31/5 - 31/6/1993 Trung đoàn 293 đã tổ chức 4 đợt hành quân bằng đường sắt và đường bộ vào huyện Cam Ranh (nay là thành phố Cam Ranh, tỉnh Khánh Hòa), bảo đảm an toàn tuyệt đối về mọi mặt. Ngay từ ngày đầu thành lập, Đảng ủy, chỉ huy Trung đoàn đã quán triệt sâu sắc nghị quyết, chỉ thị, mệnh lệnh của cấp trên, nắm vững chức năng nhiệm vụ của đơn vị. Trung đoàn đã nhanh chóng ổn định về mọi mặt, tổ chức huấn luyện bổ sung và làm công tác chuẩn bị cho thực hiện nhiệm vụ. Tập trung xây dựng đơn vị ổn định về chính trị, tư tưởng và tổ chức, làm cho cán bộ, chiến sỹ nhận thức rõ vị trí chức năng nhiệm vụ của Trung đoàn. Nội bộ đơn vị đoàn kết một lòng, luôn chủ động khắc phục khó khăn gian khổ, hoàn thành thắng lợi mọi nhiệm vụ được giao. Chỉ trong một thời gian ngắn, Trung đoàn đã ổn định tổ chức biên chế và hành quân vào vị trí thực hiện nhiệm vụ an toàn, sẵn sàng thực hiện nhiệm vụ được ngay. 
      + Ngày 01/8/1993, Trung đoàn tổ chức ra quân thực hiện nhiệm vụ XDCT đầu tiên.
      + Từ tháng 08/1993 đến tháng 03/2008, Trung đoàn đã tổ chức thi công hoàn thành nhiều công trình chiến đấu và đường cơ động ở khu vực duyên hải Nam Trung bộ, đường tuần tra biên giới; trong giai đoạn này, ngày 08 tháng 4 năm 2001, Tiểu đoàn 27 thuộc Trung đoàn được tặng thưởng danh hiệu Anh hùng lực lượng vũ trang nhân dân; ngày 08 tháng 4 năm 2008, Trung đoàn được tặng thưởng Huân chương Bảo vệ Tổ quốc hạng ba. 
      + Đầu năm 2009, Trung đoàn được giao nhiệm vụ xây dựng, quản lý, bảo quản, bảo vệ cụm công trình CT229 và huấn luyện chiến sĩ mới.
      + Ngày 15/8/2011, Bộ Quốc phòng ra Quyết định số 2890/QĐ-BQP về việc nâng cấp Trung đoàn Công binh Công trình 293 lên Lữ đoàn Công binh Công trình 293.
      + Năm 2013, được Chủ tịch nước tặng thưởng danh hiệu Anh hùng lực lượng vũ trang nhân dân. 
      + Năm 2014, với thành tích xuất sắc giải cứu thành công 12 công nhân bị mắc kẹt trong sự cố sập hầm Nhà máy thủy điện Đạ Dâng, Lâm Đồng, Lữ đoàn được tặng thưởng Huân chương Chiến công Hạng nhất.
      + Năm 2017, được Chủ tịch nước tặng thưởng Huân chương Bảo vệ Tổ quốc hạng Ba.
      + 08/4/2023 Lữ đoàn tổ chức Lễ kỷ niệm 30 năm ngày thành lập  và đón nhận huân chương Bảo vệ Tổ quốc hạng Nhì.

- Thành tích đạt được:
      Trải qua hơn 32 năm xây dựng, phấn đấu và trưởng thành, cán bộ, chiến sĩ Lữ đoàn 293 luôn nêu cao tinh thần dũng cảm, mưu trí, sáng tạo, dám nghĩ, dám làm, vượt qua mọi khó khăn gian khổ, không ngừng phấn đấu vươn lên hoàn thành mọi nhiệm vụ, đã được Đảng, Nhà nước khen tặng nhiều phần thưởng cao quý như: Danh hiệu Anh hùng Lực lượng vũ trang nhân dân; 03 Huân chương Chiến công hạng Nhất; Huân chương Chiến công hạng Nhì; 02 Huân chương Chiến công hạng Ba; Huân chương Bảo vệ Tổ quốc hạng Nhì; 04 Huân chương Bảo vệ Tổ quốc hạng Ba... cùng hàng trăm lượt tập thể, cá nhân được Chính phủ, Bộ Quốc phòng, Bộ Tư lệnh Binh chủng Công Binh, cấp ủy, chính quyền địa phương khen thưởng.
$TR293SEED$::text AS txt
) AS v
WHERE NOT EXISTS (SELECT 1 FROM public.truyen_thong);

COMMIT;
