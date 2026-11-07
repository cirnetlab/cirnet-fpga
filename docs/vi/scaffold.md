# Khung bộ điều khiển và thiết bị đo

[English](../en/scaffold.md) · Tiếng Việt

[Mục lục tài liệu](index.md)

CIRNET Remote định nghĩa [kiến trúc Lab-First chuẩn](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/ARCHITECTURE.md). [Hướng dẫn hệ thống](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/vi/architecture/system.md) mô tả an toàn và điều phối hệ thống. Hardware Service quản lý trình điều khiển trạm và lớp truyền tải riêng.

Mẫu thử hướng tới EP4CE6E22C8N không có SDRAM ngoài. Trong mô phỏng, bộ điều khiển đi qua SAFE → SCANNING → SCANNED → PREPARED → ROUTED → POWERED → ARMED → RUNNING. Quét thành công cho biết bước quan sát đã sẵn sàng. An toàn điện và tính đúng của tô pô vẫn được kiểm tra riêng.

Reset đưa bộ điều khiển về SAFE và tắt điều khiển đầu ra, định tuyến, xung nhịp thí nghiệm. Trước khi cho phép điều khiển đầu ra, bộ điều khiển mô phỏng yêu cầu kế hoạch an toàn, định tuyến sẵn sàng, bảo vệ độc lập và watchdog đã kích hoạt. Các điều kiện này tiếp tục được kiểm tra trong khi chạy. Tín hiệu lỗi hoặc watchdog chặn đầu ra ngay và giữ trạng thái FAULT. Reset sau khi hết lỗi vô hiệu hóa kết quả quét và kế hoạch cũ. Xung nhịp thí nghiệm tính theo nhịp điều khiển trừu tượng. Xem [đặc tả bộ điều khiển](../../fpga/experiment-controller/README.md).

Mục tiêu EP4CE10E22C8N với SDRAM ngoài dành sẵn giao diện cho Logic Analyzer, Scope 2CH, Generator 2CH, SDRAM Arbiter, Trigger, Timestamp và CDC. Cờ khả dụng, cờ dữ liệu thu hợp lệ, cho phép phát tín hiệu và yêu cầu SDRAM đều ở mức false. Các cổng xung nhịp của từng miền chưa xác định tần số bo mạch. Xem [giao diện thiết bị đo](../../fpga/instrument/README.md).

Trước khi kích hoạt phần cứng, cần có sơ đồ bo mạch, phân chân, giới hạn điện, ADC/DAC và SDRAM đã chọn, ràng buộc thời gian, phương án xung nhịp và reset, cùng kết quả đo bảo vệ và thu nhận. Các đầu vào này vẫn là `TBD_BY_HARDWARE_DESIGN`. [Hướng dẫn ràng buộc](../../fpga/constraints/README.md) và [ghi chú Quartus](../../fpga/quartus/README.md) mô tả dữ liệu còn thiếu cho phần cứng đích. Hardware Service phụ trách giao tiếp nội bộ. Bộ điều hợp Serial và USB-SPI phụ thuộc vào việc chọn phần cứng thật.
