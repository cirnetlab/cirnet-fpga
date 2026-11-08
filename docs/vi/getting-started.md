# Bắt đầu với CIRNET FPGA

[English](../en/getting-started.md) · Tiếng Việt

[Mục lục tài liệu](index.md)

Mã nguồn hiện tại dùng Node để dựng ứng viên `cirnet-fpga-scaffold-0.2.2-native-source.tar.gz`. Dùng các mô-đun RTL `cirnet_experiment_top` và `cirnet_instrument_scaffold`. Gói ứng viên chứa RTL, hai testbench HDL, tài liệu và danh mục tệp theo SHA-256. Công cụ kiểm thử Python nằm trong kho mã dùng để kiểm chứng. [Đóng gói mã nguồn](verification.md#dựng-ứng-viên-mã-nguồn-native)

[Khóa phát hành hệ thống 0.1.4](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json) chọn gói mã nguồn v0.1.2 đã phát hành từ `d27c818aca0eb95e9ee8d9b5ba6bda3182909914` theo mã băm. [Hồ sơ kiểm chứng Windows](../en/history/verification/2026-11-05-fpga-verification.md) ghi rõ ứng viên và phạm vi kiểm thử. [Gói v0.1.1 đã phát hành](https://github.com/cirnetlab/cirnet-fpga/releases/tag/v0.1.1) giữ nguyên nguồn gốc đã ghi.

| Miền phiên bản | Giá trị hiện tại |
| --- | --- |
| Ứng viên mã nguồn FPGA | `0.2.2` |
| Wheel Contracts dùng để kiểm chứng | `cirnet-contracts==0.1.2` |
| Bao lệnh điều khiển logic | `1.0-scaffold` |
| Bản đồ thanh ghi dự kiến | `1.0-reserved` |
| Firmware và giao thức vật lý | `UNAVAILABLE` |

Ví dụ về mục tiêu thiết kế trong Contracts giữ nhãn minh họa `2.0-scaffold`. Schema điều khiển thực thi từ chối nhãn đó. Chọn bao lệnh logic theo phiên bản riêng của nó và dùng đúng mã băm của wheel Contracts và bộ cấp phát đã rà soát.

Cấu hình `CIRNET_*` được ưu tiên hơn `NETCIRCUIT_*`. Bộ khởi tạo đồng bộ hai tên cho công cụ cũ đã ghim. Bước kiểm chứng đọc `.cirnet-toolchain.json` và dùng `.netcircuit-toolchain.json` khi thiếu tệp chuẩn. Việc chọn artifact vẫn yêu cầu đúng bản phân phối, phiên bản và mã băm đã ghim.

Bắt đầu từ [ranh giới của khung RTL](scaffold.md) rồi chạy [các bước kiểm chứng](verification.md). Kho mã cung cấp mô phỏng điều khiển và các giao diện thiết bị đo đang tắt. Nạp cấu hình lên bo mạch, đóng khung dữ liệu truyền tải, thu nhận tín hiệu và xác nhận an toàn điện cần thiết kế phần cứng và bằng chứng riêng.
