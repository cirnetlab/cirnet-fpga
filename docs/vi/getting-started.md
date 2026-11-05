# Bắt đầu với CIRNET FPGA

[English](../en/getting-started.md) · Tiếng Việt

[Mục lục tài liệu](index.md)

Mã nguồn hiện tại dựng artifact mã nguồn `cirnet-fpga-scaffold-0.1.2.tar.gz`. Hai mô-đun chính là `cirnet_experiment_top` và `cirnet_instrument_scaffold`. Các mô-đun bọc tương thích chuyển tiếp tới hai mô-đun này. Gói mã nguồn chứa RTL, kiểm thử, tập lệnh và danh mục tệp để kiểm tra nguồn gốc.

| Miền phiên bản | Giá trị hiện tại |
| --- | --- |
| Artifact mã nguồn FPGA | `0.1.2` |
| Wheel Contracts dùng để kiểm chứng | `cirnet-contracts==0.1.2` |
| Bao lệnh điều khiển logic | `1.0-scaffold` |
| Bản đồ thanh ghi dự kiến | `1.0-reserved` |
| Firmware và giao thức vật lý | `UNAVAILABLE` |

Ví dụ về mục tiêu thiết kế trong Contracts giữ nhãn minh họa `2.0-scaffold`. Schema điều khiển thực thi từ chối nhãn đó. Chọn bao lệnh logic theo phiên bản riêng của nó và dùng đúng mã băm của wheel Contracts và bộ cấp phát đã rà soát.

Bắt đầu từ [ranh giới của khung RTL](scaffold.md) rồi chạy [các bước kiểm chứng](verification.md). Kho mã cung cấp mô phỏng điều khiển và các giao diện thiết bị đo đang tắt. Nạp cấu hình lên bo mạch, đóng khung dữ liệu truyền tải, thu nhận tín hiệu và xác nhận an toàn điện cần thiết kế phần cứng và bằng chứng riêng.
